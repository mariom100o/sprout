package com.sprout.blocker

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class SproutBlockerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val PREFS_NAME = "SproutBlockerPrefs"
        const val KEY_FUEL = "fuelBalance"
        const val KEY_SESSION = "sessionEndsAt"
    }

    override fun getName() = "SproutBlocker"

    @ReactMethod
    fun requestAccessibilityPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_ACCESSIBILITY", e.message, e)
        }
    }

    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        try {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${reactContext.packageName}")
            ).apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK }
            reactContext.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_OVERLAY", e.message, e)
        }
    }

    @ReactMethod
    fun isAccessibilityEnabled(promise: Promise) {
        promise.resolve(SproutAccessibilityService.isEnabled(reactContext))
    }

    /** Called every time fuel or session changes in JS — persists to SharedPrefs for native overlay */
    @ReactMethod
    fun updateFuelCache(fuelBalance: Int, sessionEndsAt: Double, promise: Promise) {
        try {
            reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().apply {
                putInt(KEY_FUEL, fuelBalance)
                putLong(KEY_SESSION, sessionEndsAt.toLong())
                apply()
            }
            // Also update the live service if it's running
            SproutAccessibilityService.instance?.updateSession(sessionEndsAt.toLong())
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_CACHE", e.message, e)
        }
    }

    @ReactMethod
    fun startBlocking(packageNames: ReadableArray, sessionEndsAt: Double, promise: Promise) {
        try {
            val packages = (0 until packageNames.size()).mapNotNull { packageNames.getString(it) }
            SproutAccessibilityService.instance?.updateConfig(packages, sessionEndsAt.toLong())
            reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().apply {
                putLong(KEY_SESSION, sessionEndsAt.toLong())
                apply()
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_START", e.message, e)
        }
    }

    @ReactMethod
    fun stopBlocking(promise: Promise) {
        try {
            SproutAccessibilityService.instance?.updateConfig(emptyList(), Long.MAX_VALUE)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_STOP", e.message, e)
        }
    }

    @ReactMethod
    fun dismissOverlay(promise: Promise) {
        try {
            SproutOverlayService.instance?.dismiss()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_DISMISS", e.message, e)
        }
    }

    @ReactMethod
    fun dismissOverlayAndOpenApp(deepLink: String, promise: Promise) {
        try {
            SproutOverlayService.instance?.dismiss()
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLink)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            reactContext.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_DISMISS_OPEN", e.message, e)
        }
    }

    @ReactMethod
    fun dismissOverlayAndGoHome(promise: Promise) {
        try {
            SproutOverlayService.instance?.dismiss()
            val intent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_HOME)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_DISMISS_HOME", e.message, e)
        }
    }

    fun sendBlockedEvent(packageName: String) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onBlockedAppLaunched", packageName)
    }

    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}
}
