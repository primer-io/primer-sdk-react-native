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
        executeMandateAction(promise, StripeAchMandateManager.Companion.acceptMandate, UNITIALIZED_ACCEPT_MANDATE)
    }
    
    @ReactMethod
    fun declineMandate(promise: Promise) {
        executeMandateAction(promise, StripeAchMandateManager.Companion.declineMandate, UNITIALIZED_DECLINE_MANDATE)
    }
    
    private fun executeMandateAction(promise: Promise, action: (suspend () -> Unit)?, error: String) {
        val lifecycleScope = getLifecycleScopeOrNull()
    
        if (lifecycleScope == null) {
            val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNSUPPORTED_ACTIVITY_ERROR
            promise.reject(exception.errorId, exception.description)
        } else {
            lifecycleScope.launch {
                if (action == null) {
                    val exception = ErrorTypeRN.NativeBridgeFailed errorTo error
                    promise.reject(exception.errorId, exception.description)
                } else {
                    action()
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
