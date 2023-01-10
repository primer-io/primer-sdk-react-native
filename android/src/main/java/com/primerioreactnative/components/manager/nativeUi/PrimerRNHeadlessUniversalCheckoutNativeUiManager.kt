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
import io.primer.android.components.manager.native.PrimerNativeUiPaymentMethodManager
import io.primer.android.components.manager.native.PrimerNativeUiPaymentMethodManagerInterface

@ExperimentalPrimerApi
internal class PrimerRNHeadlessUniversalCheckoutNativeUiManager(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  private lateinit var nativeUiManager: PrimerNativeUiPaymentMethodManagerInterface
  private var paymentMethodTypeStr: String? = null

  override fun getName() = "RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager"

  @ReactMethod
  fun configure(paymentMethodTypeStr: String, promise: Promise) {
    try {
      nativeUiManager = PrimerNativeUiPaymentMethodManager.newInstance(
        paymentMethodTypeStr
      )
      this.paymentMethodTypeStr = paymentMethodTypeStr
      promise.resolve(null)
    } catch (e: Exception) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo e.message.orEmpty()
      promise.reject(exception.errorId, exception.description, e)
    }
  }

  @ReactMethod
  fun showPaymentMethod(
    intentStr: String,
    promise: Promise
  ) {

    if (::nativeUiManager.isInitialized.not()) {
      val exception = PrimerErrorRN(
        ErrorTypeRN.NativeBridgeFailed.errorId,
        "The NativeUIManager has not been initialized.",
        null,
        "Initialize the NativeUIManager by calling the configure function" +
          " and providing a payment method type."
      )
      promise.reject(exception.errorId, exception.description)
    } else if (PrimerSessionIntent.values()
        .firstOrNull { intentStr.equals(it.name, true) } == null
    ) {
      val exception = PrimerErrorRN(
        ErrorTypeRN.NativeBridgeFailed.errorId,
        "Invalid value for 'intent'.",
        null,
        "'intent' can be 'CHECKOUT' or 'VAULT'."
      )
      promise.reject(exception.errorId, exception.description)
    } else {
      nativeUiManager.showPaymentMethod(
        reactContext,
        PrimerSessionIntent.valueOf(intentStr.uppercase())
      )
    }
  }
}
