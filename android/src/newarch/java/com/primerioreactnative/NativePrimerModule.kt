package java.com.primerioreactnative

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.primerioreactnative.DefaultNativePrimerModule
import com.primerioreactnative.NativePrimerSpec
import kotlinx.serialization.json.Json

class NativePrimerModule(private val reactContext: ReactApplicationContext, private val json: Json) :
  NativePrimerSpec(reactContext) {
  private val implementation by lazy {
    DefaultNativePrimerModule(
      reactContext = reactContext,
      json = json,
      eventSender = { name, params ->
        val eventData = Arguments.createMap().apply {
          putString("eventType", name)
          putMap("data", params)
        }
        emitOnEvent(eventData)
      }
    )
  }

  override fun configure(settings: String?, promise: Promise) {
    implementation.configure(settings, promise)
  }

  override fun showUniversalCheckoutWithClientToken(
    clientToken: String,
    promise: Promise
  ) {
    implementation.showUniversalCheckoutWithClientToken(clientToken, promise)
  }

  override fun showVaultManagerWithClientToken(
    clientToken: String,
    promise: Promise
  ) {
    implementation.showVaultManagerWithClientToken(clientToken, promise)
  }

  override fun showPaymentMethod(
    paymentMethod: String,
    intent: String,
    clientToken: String,
    promise: Promise
  ) {
    implementation.showPaymentMethod(paymentMethod, intent, clientToken, promise)
  }

  override fun dismiss(promise: Promise) {
    implementation.dismiss(promise)
  }

  override fun cleanUp(promise: Promise) {
    implementation.cleanUp(promise)
  }

  override fun handleTokenizationNewClientToken(
    newClientToken: String,
    promise: Promise
  ) {
    implementation.handleTokenizationNewClientToken(newClientToken, promise)

  }

  override fun handleTokenizationSuccess(promise: Promise) {
    implementation.handleTokenizationSuccess(promise)
  }

  override fun handleTokenizationFailure(errorMessage: String?, promise: Promise) {
    implementation.handleTokenizationFailure(errorMessage, promise)
  }

  override fun handleResumeWithNewClientToken(
    newClientToken: String,
    promise: Promise
  ) {
    implementation.handleResumeWithNewClientToken(newClientToken, promise)
  }

  override fun handleResumeSuccess(promise: Promise) {
    implementation.handleResumeSuccess(promise)
  }

  override fun handleResumeFailure(errorMessage: String?, promise: Promise) {
    implementation.handleResumeFailure(errorMessage, promise)
  }

  override fun handlePaymentCreationAbort(errorMessage: String?, promise: Promise) {
    implementation.handlePaymentCreationAbort(errorMessage, promise)
  }

  override fun handlePaymentCreationContinue(promise: Promise) {
    implementation.handlePaymentCreationContinue(promise)
  }

  override fun showErrorMessage(errorMessage: String?, promise: Promise) {
    implementation.showErrorMessage(errorMessage, promise)
  }

  override fun setImplementedRNCallbacks(
    implementedRNCallbacks: String,
    promise: Promise
  ) {
    implementation.setImplementedRNCallbacks(implementedRNCallbacks, promise)
  }
}
