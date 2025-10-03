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
          putString(EVENT_TYPE_KEY, name)
          putMap(DATA_KEY, params)
        }
        emitOnEvent(eventData)
      }
    )
  }

  override fun configure(settings: String?, promise: Promise) {
    implementation.configure(settingsStr = settings, promise = promise)
  }

  override fun showUniversalCheckoutWithClientToken(
    clientToken: String,
    promise: Promise
  ) {
    implementation.showUniversalCheckoutWithClientToken(clientToken = clientToken, promise = promise)
  }

  override fun showVaultManagerWithClientToken(
    clientToken: String,
    promise: Promise
  ) {
    implementation.showVaultManagerWithClientToken(clientToken = clientToken, promise = promise)
  }

  override fun showPaymentMethod(
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

  override fun dismiss(promise: Promise) {
    implementation.dismiss(promise)
  }

  override fun cleanUp(promise: Promise) {
    implementation.cleanUp(promise = promise)
  }

  override fun handleTokenizationNewClientToken(
    newClientToken: String,
    promise: Promise
  ) {
    implementation.handleTokenizationNewClientToken(newClientToken = newClientToken, promise = promise)
  }

  override fun handleTokenizationSuccess(promise: Promise) {
    implementation.handleTokenizationSuccess(promise = promise)
  }

  override fun handleTokenizationFailure(errorMessage: String?, promise: Promise) {
    implementation.handleTokenizationFailure(errorMessage = errorMessage, promise = promise)
  }

  override fun handleResumeWithNewClientToken(
    newClientToken: String,
    promise: Promise
  ) {
    implementation.handleResumeWithNewClientToken(newClientToken = newClientToken, promise = promise)
  }

  override fun handleResumeSuccess(promise: Promise) {
    implementation.handleResumeSuccess(promise = promise)
  }

  override fun handleResumeFailure(errorMessage: String?, promise: Promise) {
    implementation.handleResumeFailure(errorMessage = errorMessage, promise = promise)
  }

  override fun handlePaymentCreationAbort(errorMessage: String?, promise: Promise) {
    implementation.handlePaymentCreationAbort(errorMessage = errorMessage, promise = promise)
  }

  override fun handlePaymentCreationContinue(promise: Promise) {
    implementation.handlePaymentCreationContinue(promise = promise)
  }

  override fun showErrorMessage(errorMessage: String?, promise: Promise) {
    implementation.showErrorMessage(errorMessage = errorMessage, promise = promise)
  }

  override fun setImplementedRNCallbacks(
    implementedRNCallbacks: String,
    promise: Promise
  ) {
    implementation.setImplementedRNCallbacks(implementedRNCallbacksStr = implementedRNCallbacks, promise = promise)
  }

  private companion object {
    const val EVENT_TYPE_KEY = "eventType"
    const val DATA_KEY = "data"
  }
}
