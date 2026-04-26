package com.sprout.blocker

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.text.TextUtils
import android.view.accessibility.AccessibilityEvent
import androidx.core.app.NotificationCompat

class SproutAccessibilityService : AccessibilityService() {

    companion object {
        var instance: SproutAccessibilityService? = null

        private val YOUTUBE_PACKAGES = listOf(
            "com.google.android.youtube",
            "com.google.android.youtube.kids"
        )

        private const val REMINDER_CHANNEL = "sprout_reminders"
        private const val POLL_INTERVAL_MS = 5_000L

        fun isEnabled(context: Context): Boolean {
            val flat = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false
            val splitter = TextUtils.SimpleStringSplitter(':')
            splitter.setString(flat)
            while (splitter.hasNext()) {
                if (splitter.next().equals(
                        "${context.packageName}/.blocker.SproutAccessibilityService",
                        ignoreCase = true
                    )
                ) return true
            }
            return false
        }
    }

    private var blockedPackages: List<String> = YOUTUBE_PACKAGES
    private var sessionEndsAt: Long = 0L
    private var lastBlockedPkg: String = ""
    private var lastBlockedAt: Long = 0L
    private var remindersScheduledFor: Long = 0L
    private var pollerActive = false

    // Tracks whichever app is currently in the foreground
    private var currentForegroundPkg: String = ""

    private val handler = Handler(Looper.getMainLooper())

    // Fires once at exact expiry moment, then hands off to the poller
    private val expiryRunnable = Runnable {
        checkAndBlock()
        startExpiryPoller()
    }

    // Keeps checking every POLL_INTERVAL_MS while session is expired
    private val expiryPoller = object : Runnable {
        override fun run() {
            if (!pollerActive) return
            if (sessionEndsAt > System.currentTimeMillis()) {
                // Session was renewed — stop polling
                stopExpiryPoller()
                return
            }
            checkAndBlock()
            handler.postDelayed(this, POLL_INTERVAL_MS)
        }
    }

    private val reminderRunnables = mutableListOf<Runnable>()

    fun updateConfig(packages: List<String>, sessionEndsAt: Long) {
        this.blockedPackages = packages.ifEmpty { YOUTUBE_PACKAGES }
        updateSession(sessionEndsAt)
    }

    fun updateSession(newEndsAt: Long) {
        this.sessionEndsAt = newEndsAt
        handler.removeCallbacks(expiryRunnable)
        stopExpiryPoller()
        scheduleReminders(newEndsAt)
        scheduleExpiryKick(newEndsAt)
    }

    override fun onServiceConnected() {
        instance = this
        val prefs = getSharedPreferences(SproutBlockerModule.PREFS_NAME, Context.MODE_PRIVATE)
        val saved = prefs.getLong(SproutBlockerModule.KEY_SESSION, 0L)
        sessionEndsAt = saved
        createReminderChannel()
        scheduleReminders(saved)
        scheduleExpiryKick(saved)

        // No packageNames filter — watch everything so we can track the foreground app
        serviceInfo = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS
            notificationTimeout = 50
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
        val pkg = event.packageName?.toString() ?: return

        // Always track the current foreground package
        currentForegroundPkg = pkg

        // Re-read session from SharedPrefs in case JS updated it
        val prefs = getSharedPreferences(SproutBlockerModule.PREFS_NAME, Context.MODE_PRIVATE)
        val latestSession = prefs.getLong(SproutBlockerModule.KEY_SESSION, sessionEndsAt)
        if (latestSession != sessionEndsAt) updateSession(latestSession)

        if (!blockedPackages.contains(pkg)) return
        if (sessionEndsAt > System.currentTimeMillis()) return

        showOverlayFor(pkg)
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        handler.removeCallbacks(expiryRunnable)
        stopExpiryPoller()
        cancelReminderRunnables()
        instance = null
        super.onDestroy()
    }

    // ── Expiry handling ───────────────────────────────────────────────────────

    private fun scheduleExpiryKick(endsAt: Long) {
        handler.removeCallbacks(expiryRunnable)
        if (endsAt <= 0) return
        val delay = endsAt - System.currentTimeMillis()
        if (delay > 0) {
            handler.postDelayed(expiryRunnable, delay)
        } else {
            // Already expired
            checkAndBlock()
            startExpiryPoller()
        }
    }

    // Check if a blocked app is in the foreground right now and block it
    private fun checkAndBlock() {
        val pkg = currentForegroundPkg
        if (pkg.isNotEmpty() && blockedPackages.contains(pkg)) {
            showOverlayFor(pkg)
        }
    }

    private fun startExpiryPoller() {
        if (pollerActive) return
        pollerActive = true
        handler.postDelayed(expiryPoller, POLL_INTERVAL_MS)
    }

    private fun stopExpiryPoller() {
        pollerActive = false
        handler.removeCallbacks(expiryPoller)
    }

    private fun showOverlayFor(pkg: String) {
        val now = System.currentTimeMillis()
        if (pkg == lastBlockedPkg && now - lastBlockedAt < 3_000) return
        lastBlockedPkg = pkg
        lastBlockedAt = now

        val intent = Intent(this, SproutOverlayService::class.java).apply {
            putExtra("blockedPackage", pkg)
        }
        startService(intent)
    }

    // ── Reminder notifications ────────────────────────────────────────────────

    private fun scheduleReminders(endsAt: Long) {
        if (endsAt <= 0 || endsAt == remindersScheduledFor) return
        cancelReminderRunnables()
        remindersScheduledFor = endsAt
        val now = System.currentTimeMillis()
        val remaining = endsAt - now
        if (remaining <= 0) return

        val milestones = listOf(
            10 * 60 * 1000L to "10 minutes left on YouTube!",
            5  * 60 * 1000L to "5 minutes left on YouTube!",
            60 * 1000L      to "1 minute left — finish up!",
            30 * 1000L      to "30 seconds left!"
        )

        for ((threshold, message) in milestones) {
            val delay = remaining - threshold
            if (delay > 0) {
                val r = Runnable { showReminderNotification(message) }
                reminderRunnables.add(r)
                handler.postDelayed(r, delay)
            } else if (remaining > threshold - 5_000) {
                showReminderNotification(message)
            }
        }
    }

    private fun cancelReminderRunnables() {
        for (r in reminderRunnables) handler.removeCallbacks(r)
        reminderRunnables.clear()
    }

    private fun createReminderChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(
                REMINDER_CHANNEL,
                "Sprout Time Reminders",
                NotificationManager.IMPORTANCE_HIGH
            ).apply { description = "Screen time countdown alerts" }
            (getSystemService(NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(ch)
        }
    }

    private fun showReminderNotification(message: String) {
        val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        val pi = PendingIntent.getActivity(
            this, 0,
            packageManager.getLaunchIntentForPackage(packageName),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        val notif = NotificationCompat.Builder(this, REMINDER_CHANNEL)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("⏰ Sprout Time Reminder")
            .setContentText(message)
            .setContentIntent(pi)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()
        nm.notify(message.hashCode(), notif)
    }
}
