package com.primerioreactnative.components.manager.nativeUi

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.PrimerErrorRN
import com.primerioreactnative.utils.errorTo
import io.primer.android.ExperimentalPrimerApi
import io.primer.android.PrimerSessionIntent
import io.primer.android.components.SdkUninitializedException
import io.primer.android.components.domain.exception.UnsupportedPaymentMethodManagerException
import io.primer.android.components.manager.nativeUi.PrimerHeadlessUniversalCheckoutNativeUiManager
import io.primer.android.components.manager.nativeUi.PrimerHeadlessUniversalCheckoutNativeUiManagerInterface
import io.primer.android.domain.exception.UnsupportedPaymentIntentException

@ExperimentalPrimerApi
internal class PrimerRNHeadlessUniversalCheckoutNativeUiManager(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
    private lateinit var nativeUiManager: PrimerHeadlessUniversalCheckoutNativeUiManagerInterface
    private var paymentMethodTypeStr: String? = null

    override fun getName() = "RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager"

    @ReactMethod
    fun configure(
        paymentMethodTypeStr: String,
        promise: Promise,
    ) {
        try {
            nativeUiManager =
                PrimerHeadlessUniversalCheckoutNativeUiManager.newInstance(
                    paymentMethodTypeStr,
                )
            this.paymentMethodTypeStr = paymentMethodTypeStr
            promise.resolve(null)
        } catch (e: SdkUninitializedException) {
            promise.reject(ErrorTypeRN.UnitializedSdkSession.errorId, e.message, e)
        } catch (e: UnsupportedPaymentMethodManagerException) {
            promise.reject(ErrorTypeRN.UnsupportedPaymentMethod.errorId, e.message, e)
        } catch (e: Exception) {
            val exception =
                ErrorTypeRN.NativeBridgeFailed errorTo e.message.orEmpty()
            promise.reject(exception.errorId, exception.description, e)
        }
    }

    @ReactMethod
    fun showPaymentMethod(
        intentStr: String,
        promise: Promise,
    ) {
        if (::nativeUiManager.isInitialized.not()) {
            val exception =
                PrimerErrorRN(
                    errorId = ErrorTypeRN.NativeBridgeFailed.errorId,
                    errorCode = null,
                    description = "The NativeUIManager has not been initialized.",
                    diagnosticsId = null,
                    recoverySuggestion =
                    "Initialize the NativeUIManager by calling the configure function" +
                        " and providing a payment method type.",
                )
            promise.reject(exception.errorId, exception.description)
        } else if (PrimerSessionIntent.values()
                .firstOrNull { intentStr.equals(it.name, true) } == null
        ) {
            val exception =
                PrimerErrorRN(
                    errorId = ErrorTypeRN.NativeBridgeFailed.errorId,
                    errorCode = null,
                    description = "Invalid value for 'intent'.",
                    diagnosticsId = null,
                    recoverySuggestion = "'intent' can be 'CHECKOUT' or 'VAULT'.",
                )
            promise.reject(exception.errorId, exception.description)
        } else {
            try {
                nativeUiManager.showPaymentMethod(
                    reactContext,
                    PrimerSessionIntent.valueOf(intentStr.uppercase()),
                )
            } catch (e: UnsupportedPaymentIntentException) {
                promise.reject(ErrorTypeRN.UnsupportedPaymentIntent.errorId, e.message, e)
            } catch (e: Exception) {
                val exception =
                    ErrorTypeRN.NativeBridgeFailed errorTo e.message.orEmpty()
                promise.reject(exception.errorId, exception.description, e)
            }
        }
    }
}
