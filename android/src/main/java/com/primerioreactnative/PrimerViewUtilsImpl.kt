package com.primerioreactnative

import android.content.res.Resources
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

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
}
