package com.primerioreactnative.huc.manager.nativeUi

import androidx.activity.ComponentActivity
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
  fun initialize(paymentMethodTypeStr: String, promise: Promise) {
    try {
      nativeUiManager = PrimerNativeUiPaymentMethodManager.newInstance(
        paymentMethodTypeStr
      )
      this.paymentMethodTypeStr = paymentMethodTypeStr
      promise.resolve(null)
    } catch (e: Exception) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo e.message.orEmpty()
      promise.reject(exception.errorId, exception.description)
    }
  }

  @ReactMethod
  fun showPaymentMethod(
    intentStr: String,
    promise: Promise
  ) {

    if (::nativeUiManager.isInitialized.not()) {
      val exception = PrimerErrorRN(
        ErrorTypeRN.UninitializedManager.errorId,
        "The NativeUIManager has not been initialized.",
        "Initialize the NativeUIManager by calling the initialize function and providing a payment method type."
      )
      promise.reject(exception.errorId, exception.description)
    } else if (PrimerSessionIntent.values()
        .firstOrNull { intentStr.equals(it.name, true) } == null
    ) {
      val exception = PrimerErrorRN(
        ErrorTypeRN.NativeBridgeFailed.errorId,
        "Invalid intent $intentStr",
      )
      promise.reject(exception.errorId, exception.description)
    } else {
      nativeUiManager.showPaymentMethod(
        reactContext.currentActivity as ComponentActivity,
        PrimerSessionIntent.valueOf(intentStr.uppercase())
      )
    }
  }
}

