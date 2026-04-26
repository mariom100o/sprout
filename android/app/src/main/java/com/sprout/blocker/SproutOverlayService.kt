package com.sprout.blocker

import android.app.*
import android.content.Context
import android.content.Intent
import android.graphics.*
import android.graphics.drawable.GradientDrawable
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.view.*
import android.widget.*
import androidx.core.app.NotificationCompat

class SproutOverlayService : Service() {

    companion object {
        var instance: SproutOverlayService? = null
        private const val CHANNEL_ID = "sprout_overlay"
        private const val NOTIF_ID = 1001

        private val INK = Color.parseColor("#1B2E1F")
        private val PAPER = Color.parseColor("#F4F1E8")
        private val MOSS = Color.parseColor("#4A7C3A")
        private val EARTH = Color.parseColor("#C97D5C")
        private val MUTED = Color.parseColor("#5C6B5E")
        private val EARTH_LT = Color.parseColor("#E8B89A")
    }

    private var windowManager: WindowManager? = null
    private var overlayRoot: View? = null
    private var audioManager: AudioManager? = null
    private var focusRequest: AudioFocusRequest? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        instance = this
        audioManager = getSystemService(AUDIO_SERVICE) as AudioManager
        createNotificationChannel()
        startForeground(NOTIF_ID, buildNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (!Settings.canDrawOverlays(this)) { stopSelf(); return START_NOT_STICKY }
        if (overlayRoot != null) return START_NOT_STICKY   // already showing
        claimAudioFocus()
        showOverlay()
        return START_NOT_STICKY
    }

    // Claiming audio focus causes YouTube (and any other media app) to pause playback.
    private fun claimAudioFocus() {
        val am = audioManager ?: return
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val attrs = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build()
                val req = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                    .setAudioAttributes(attrs)
                    .setOnAudioFocusChangeListener {}
                    .build()
                focusRequest = req
                am.requestAudioFocus(req)
            } else {
                @Suppress("DEPRECATION")
                am.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
            }
        } catch (_: Exception) {
            // Audio focus is best-effort — overlay still blocks the screen if this fails
        }
    }

    private fun releaseAudioFocus() {
        val am = audioManager ?: return
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                focusRequest?.let { am.abandonAudioFocusRequest(it) }
            } else {
                @Suppress("DEPRECATION")
                am.abandonAudioFocus(null)
            }
        } catch (_: Exception) {}
        focusRequest = null
    }

    private fun dp(value: Float) = (value * resources.displayMetrics.density + 0.5f).toInt()

    private fun showOverlay() {
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        val prefs = getSharedPreferences(SproutBlockerModule.PREFS_NAME, Context.MODE_PRIVATE)
        val fuel = prefs.getInt(SproutBlockerModule.KEY_FUEL, 0)
        val canAfford = fuel >= 50

        // ── Scrim ────────────────────────────────────────────────────────────
        val scrim = FrameLayout(this).apply {
            setBackgroundColor(Color.argb(200, 27, 46, 31))
        }

        // ── Card ─────────────────────────────────────────────────────────────
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(28f), dp(28f), dp(28f), dp(28f))
            background = GradientDrawable().apply {
                setColor(PAPER)
                cornerRadius = dp(24f).toFloat()
            }
        }

        // Title row
        val titleRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        val emoji = TextView(this).apply {
            text = "🌱"
            textSize = 28f
        }
        val titleCol = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12f), 0, 0, 0)
        }
        val title = TextView(this).apply {
            text = "Hold on!"
            setTextColor(INK)
            textSize = 20f
            setTypeface(typeface, Typeface.BOLD)
        }
        val subtitle = TextView(this).apply {
            text = "Sprout needs fuel to continue"
            setTextColor(MUTED)
            textSize = 13f
        }
        titleCol.addView(title)
        titleCol.addView(subtitle)
        titleRow.addView(emoji)
        titleRow.addView(titleCol)
        card.addView(titleRow)

        // Message box
        val msgBox = TextView(this).apply {
            val costText = "You need 50 ⚡ fuel for 15 min of YouTube."
            val balanceText = "\nYour balance: $fuel ⚡"
            text = costText + balanceText
            setTextColor(INK)
            textSize = 15f
            gravity = Gravity.CENTER
            setPadding(dp(16f), dp(16f), dp(16f), dp(16f))
            background = GradientDrawable().apply {
                setColor(Color.argb(40, 201, 125, 92))
                cornerRadius = dp(14f).toFloat()
            }
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(0, dp(18f), 0, dp(18f)) }
            layoutParams = lp
        }
        card.addView(msgBox)

        // Primary button
        val primaryBtn = Button(this).apply {
            text = if (canAfford) "Spend 50 fuel — Watch now" else "Earn Fuel First"
            setTextColor(Color.WHITE)
            textSize = 15f
            background = GradientDrawable().apply {
                setColor(MOSS)
                cornerRadius = dp(16f).toFloat()
            }
            setPadding(dp(8f), dp(14f), dp(8f), dp(14f))
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(0, 0, 0, dp(10f)) }
            layoutParams = lp
            setOnClickListener {
                dismiss()
                val link = if (canAfford) "sprout:///(kid)/spend" else "sprout:///(kid)/earn"
                openApp(link)
            }
        }
        card.addView(primaryBtn)

        // Secondary button — open Sprout app
        val secondaryBtn = Button(this).apply {
            text = "Open Sprout"
            setTextColor(MUTED)
            textSize = 14f
            background = GradientDrawable().apply {
                setColor(Color.argb(40, 92, 107, 94))
                cornerRadius = dp(16f).toFloat()
            }
            setPadding(dp(8f), dp(12f), dp(8f), dp(12f))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            setOnClickListener {
                dismiss()
                openApp("sprout:///(kid)/home")
            }
        }
        card.addView(secondaryBtn)

        // Centre card in scrim with margin
        val cardParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        ).apply {
            gravity = Gravity.CENTER
            setMargins(dp(32f), 0, dp(32f), 0)
        }
        scrim.addView(card, cardParams)
        overlayRoot = scrim

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
        }

        windowManager?.addView(scrim, params)
    }

    private fun openApp(deepLink: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLink)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            startActivity(intent)
        } catch (_: Exception) {
            val fallback = packageManager.getLaunchIntentForPackage(packageName)?.apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            fallback?.let { startActivity(it) }
        }
    }

    fun dismiss() {
        overlayRoot?.let { windowManager?.removeView(it) }
        overlayRoot = null
        releaseAudioFocus()
        stopSelf()
    }

    override fun onDestroy() {
        overlayRoot?.let { try { windowManager?.removeView(it) } catch (_: Exception) {} }
        overlayRoot = null
        releaseAudioFocus()
        instance = null
        super.onDestroy()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(CHANNEL_ID, "Sprout Screen Guard", NotificationManager.IMPORTANCE_LOW)
            (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(ch)
        }
    }

    private fun buildNotification(): Notification {
        val pi = PendingIntent.getActivity(
            this, 0,
            packageManager.getLaunchIntentForPackage(packageName),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Sprout is active")
            .setContentText("Screen time is being managed")
            .setSmallIcon(android.R.drawable.ic_menu_manage)
            .setContentIntent(pi)
            .build()
    }
}
