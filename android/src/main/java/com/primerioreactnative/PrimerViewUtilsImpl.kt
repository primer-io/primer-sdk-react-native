package com.primerioreactnative

import android.content.res.Resources
import android.graphics.Typeface
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.assets.ReactFontManager

internal class PrimerViewUtilsImpl(
    private val reactContext: ReactApplicationContext,
) {
    fun getBottomSafeAreaInset(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.resolve(0.0)
            return
        }
        activity.runOnUiThread {
            try {
                val insets = ViewCompat.getRootWindowInsets(activity.window.decorView)
                if (insets == null) {
                    promise.resolve(0.0)
                    return@runOnUiThread
                }
                val bottomPx = insets.getInsets(WindowInsetsCompat.Type.systemBars()).bottom
                val density = Resources.getSystem().displayMetrics.density
                promise.resolve((bottomPx / density).toDouble())
            } catch (_: Exception) {
                promise.resolve(0.0)
            }
        }
    }

    fun isFontAvailable(fontFamily: String, promise: Promise) {
        // React Native never fails a font lookup: an unknown family comes back as the default typeface.
        val typeface = ReactFontManager.getInstance().getTypeface(fontFamily, Typeface.NORMAL, reactContext.assets)
        promise.resolve(typeface != Typeface.DEFAULT || fontFamily.equals("sans-serif", ignoreCase = true))
    }
}
