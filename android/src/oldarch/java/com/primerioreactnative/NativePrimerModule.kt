package java.com.primerioreactnative

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.DefaultNativePrimerModule
import kotlinx.serialization.json.Json

class NativePrimerModule(private val reactContext: ReactApplicationContext, private val json: Json) :
  ReactContextBaseJavaModule(reactContext) {
  private val implementation by lazy {
    DefaultNativePrimerModule(
      reactContext = reactContext,
      json = json,
      eventSender = { name, params ->
        reactApplicationContext.getJSModule(
          DeviceEventManagerModule.RCTDeviceEventEmitter::class.java,
        ).emit(name, params)
      }
    )
  }

  override fun getName(): String {
    return DefaultNativePrimerModule.NAME
  }

  @ReactMethod
  fun configure(settings: String?, promise: Promise) {
    implementation.configure(settingsStr = settings, promise = promise)
  }

  @ReactMethod
  fun showUniversalCheckoutWithClientToken(
    clientToken: String,
    promise: Promise
  ) {
    implementation.showUniversalCheckoutWithClientToken(clientToken = clientToken, promise = promise)
  }

  @ReactMethod
  fun showVaultManagerWithClientToken(
    clientToken: String,
    promise: Promise
  ) {
    implementation.showVaultManagerWithClientToken(clientToken = clientToken, promise = promise)
  }

  @ReactMethod
  fun showPaymentMethod(
    paymentMethod: String,
    intent: String,
    clientToken: String,
    promise: Promise
  ) {
    implementation.showPaymentMethod(
      paymentMethod = paymentMethod,
      intent = intent,
      clientToken = clientToken,
      promise = promise
    )
  }

  @ReactMethod
  fun dismiss(promise: Promise) {
    implementation.dismiss(promise = promise)
  }

  @ReactMethod
  fun cleanUp(promise: Promise) {
    implementation.cleanUp(promise = promise)
  }

  @ReactMethod
  fun handleTokenizationNewClientToken(
    newClientToken: String,
    promise: Promise
  ) {
    implementation.handleTokenizationNewClientToken(newClientToken = newClientToken, promise = promise)

  }

  @ReactMethod
  fun handleTokenizationSuccess(promise: Promise) {
    implementation.handleTokenizationSuccess(promise = promise)
  }

  @ReactMethod
  fun handleTokenizationFailure(errorMessage: String?, promise: Promise) {
    implementation.handleTokenizationFailure(errorMessage = errorMessage, promise = promise)
  }

  @ReactMethod
  fun handleResumeWithNewClientToken(
    newClientToken: String,
    promise: Promise
  ) {
    implementation.handleResumeWithNewClientToken(newClientToken = newClientToken, promise = promise)
  }

  @ReactMethod
  fun handleResumeSuccess(promise: Promise) {
    implementation.handleResumeSuccess(promise = promise)
  }

  @ReactMethod
  fun handleResumeFailure(errorMessage: String?, promise: Promise) {
    implementation.handleResumeFailure(errorMessage = errorMessage, promise =  promise)
  }

  @ReactMethod
  fun handlePaymentCreationAbort(errorMessage: String?, promise: Promise) {
    implementation.handlePaymentCreationAbort(errorMessage = errorMessage, promise = promise)
  }

  @ReactMethod
  fun handlePaymentCreationContinue(promise: Promise) {
    implementation.handlePaymentCreationContinue(promise = promise)
  }

  @ReactMethod
  fun showErrorMessage(errorMessage: String?, promise: Promise) {
    implementation.showErrorMessage(errorMessage = errorMessage, promise =  promise)
  }

  @ReactMethod
  fun setImplementedRNCallbacks(
    implementedRNCallbacks: String,
    promise: Promise
  ) {
    implementation.setImplementedRNCallbacks(implementedRNCallbacksStr = implementedRNCallbacks, promise = promise)
  }
}
