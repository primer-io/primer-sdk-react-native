package com.primerioreactnative.components.manager.ach

import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.lifecycleScope
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.utils.errorTo
import kotlinx.coroutines.launch

class StripeAchMandateManager(
        private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "StripeAchMandateManager"

    @ReactMethod
    fun acceptMandate(promise: Promise) {
        val lifecycleScope = getLifecycleScopeOrNull()

        if (lifecycleScope == null) {
            val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNSUPPORTED_ACTIVITY_ERROR
            promise.reject(exception.errorId, exception.description)
        } else {
            lifecycleScope.launch {
                val function = StripeAchMandateManager.Companion.acceptMandate
                if (function == null) {
                    val exception =
                            ErrorTypeRN.NativeBridgeFailed errorTo UNITIALIZED_ACCEPT_MANDATE
                    promise.reject(exception.errorId, exception.description)
                } else {
                    function()
                    promise.resolve(null)
                }
            }
        }
    }

    @ReactMethod
    fun declineMandate(promise: Promise) {
        val lifecycleScope = getLifecycleScopeOrNull()

        if (lifecycleScope == null) {
            val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNSUPPORTED_ACTIVITY_ERROR
            promise.reject(exception.errorId, exception.description)
        } else {
            lifecycleScope.launch {
                val function = StripeAchMandateManager.Companion.declineMandate
                if (function == null) {
                    val exception =
                            ErrorTypeRN.NativeBridgeFailed errorTo UNITIALIZED_DECLINE_MANDATE
                    promise.reject(exception.errorId, exception.description)
                } else {
                    function()
                    promise.resolve(null)
                }
            }
        }
    }

    private fun getLifecycleScopeOrNull() =
            (reactContext.currentActivity as? LifecycleOwner)?.lifecycleScope

    companion object {
        var acceptMandate: (suspend () -> Unit)? = null
        var declineMandate: (suspend () -> Unit)? = null

        val UNSUPPORTED_ACTIVITY_ERROR =
                """
                Unsupported activity type.
                Make sure your root activity extends LifecycleOwner.
        """.trimIndent()

        val UNITIALIZED_ACCEPT_MANDATE =
                """
                Unitialized 'acceptMandate' property.
        """.trimIndent()

        val UNITIALIZED_DECLINE_MANDATE =
                """
                Unitialized 'declineMandate' property.
        """.trimIndent()
    }
}
