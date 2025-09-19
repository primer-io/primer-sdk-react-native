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
    implementation.configure(settings, promise)
  }

  @ReactMethod
  fun showUniversalCheckoutWithClientToken(
    clientToken: String,
    promise: Promise
  ) {
    implementation.showUniversalCheckoutWithClientToken(clientToken, promise)
  }

  @ReactMethod
  fun showVaultManagerWithClientToken(
    clientToken: String,
    promise: Promise
  ) {
    implementation.showVaultManagerWithClientToken(clientToken, promise)
  }

  @ReactMethod
  fun showPaymentMethod(
    paymentMethod: String,
    intent: String,
    clientToken: String,
    promise: Promise
  ) {
    implementation.showPaymentMethod(paymentMethod, intent, clientToken, promise)
  }

  @ReactMethod
  fun dismiss(promise: Promise) {
    implementation.dismiss(promise)
  }

  @ReactMethod
  fun cleanUp(promise: Promise) {
    implementation.cleanUp(promise)
  }

  @ReactMethod
  fun handleTokenizationNewClientToken(
    newClientToken: String,
    promise: Promise
  ) {
    implementation.handleTokenizationNewClientToken(newClientToken, promise)

  }

  @ReactMethod
  fun handleTokenizationSuccess(promise: Promise) {
    implementation.handleTokenizationSuccess(promise)
  }

  @ReactMethod
  fun handleTokenizationFailure(errorMessage: String?, promise: Promise) {
    implementation.handleTokenizationFailure(errorMessage, promise)
  }

  @ReactMethod
  fun handleResumeWithNewClientToken(
    newClientToken: String,
    promise: Promise
  ) {
    implementation.handleResumeWithNewClientToken(newClientToken, promise)
  }

  @ReactMethod
  fun handleResumeSuccess(promise: Promise) {
    implementation.handleResumeSuccess(promise)
  }

  @ReactMethod
  fun handleResumeFailure(errorMessage: String?, promise: Promise) {
    implementation.handleResumeFailure(errorMessage, promise)
  }

  @ReactMethod
  fun handlePaymentCreationAbort(errorMessage: String?, promise: Promise) {
    implementation.handlePaymentCreationAbort(errorMessage, promise)
  }

  @ReactMethod
  fun handlePaymentCreationContinue(promise: Promise) {
    implementation.handlePaymentCreationContinue(promise)
  }

  @ReactMethod
  fun showErrorMessage(errorMessage: String?, promise: Promise) {
    implementation.showErrorMessage(errorMessage, promise)
  }

  @ReactMethod
  fun setImplementedRNCallbacks(
    implementedRNCallbacks: String,
    promise: Promise
  ) {
    implementation.setImplementedRNCallbacks(implementedRNCallbacks, promise)
  }
}
