package com.primerioreactnative

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.datamodels.*
import io.primer.android.PaymentMethodIntent
import io.primer.android.Primer
import io.primer.android.model.dto.PrimerConfig
import io.primer.android.model.dto.PrimerPaymentMethod
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

class PrimerRN(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var settings: PrimerSettingsRN = PrimerSettingsRN()
  private var theme: PrimerThemeRN = PrimerThemeRN()
  private var intent: PaymentMethodIntent? = null
  private var paymentMethod: PrimerPaymentMethod? = null

  private var mListener = PrimerRNEventListener()

  private var sdkWasInitialised = false

  private val json = Json { ignoreUnknownKeys = true }

  init {
      mListener.sendEvent = { eventName, paramsJson -> sendEvent(eventName, paramsJson) }
      mListener.sendError = { paramsJson -> sendEvent(PrimerEventsRN.OnError.string, paramsJson) }
  }

  override fun getName(): String = "NativePrimer"

  @ReactMethod
  fun configureWithSettings(settingsStr: String, promise: Promise) {
    try {
      Log.d("PrimerRN", "settings: $settingsStr")
      val settings = json.decodeFromString<PrimerSettingsRN>(settingsStr)
      this.settings = settings
      startSdk()
      promise.resolve(null)
    } catch (e: Exception) {
      Log.e("PrimerRN", "configure settings error: $e")
      val exception = PrimerErrorRN(
        ErrorTypeRN.ParseJsonFailed,
        "failed to parse settings.",
      )
      checkoutFailed(exception)
      promise.reject(exception.errorType.name, exception.description, e)
    }
  }

  @ReactMethod
  fun configureWithTheme(themeStr: String, promise: Promise) {
    try {
      Log.d("PrimerRN", "theme: $themeStr")
      val theme = json.decodeFromString<PrimerThemeRN>(themeStr)
      this.theme = theme
      startSdk()
      promise.resolve(null)
    } catch (e: Exception) {
      Log.e("PrimerRN", "configure theme error: $e")
      val exception = PrimerErrorRN(
        ErrorTypeRN.ParseJsonFailed,
        "failed to parse theme.",
      )
      checkoutFailed(exception)
      promise.reject(exception.errorType.name, exception.description, e)
    }
  }

  @ReactMethod
  fun showUniversalCheckout(promise: Promise) {
    val exception = PrimerErrorRN(
      ErrorTypeRN.CheckoutFlowFailed,
      "This method not implemented, please use showUniversalCheckoutWithClientToken"
    )
    checkoutFailed(exception)
    promise.reject(exception.errorType.name, exception.description)
  }

  @ReactMethod
  fun showUniversalCheckoutWithClientToken(
    clientToken: String,
    promise: Promise
  ) {
    try {
      Primer.instance.showUniversalCheckout(reactApplicationContext.applicationContext, clientToken)
      promise.resolve(null)
    } catch (e: Exception) {
      val exception = PrimerErrorRN(
        ErrorTypeRN.CheckoutFlowFailed,
        "Call of Primer SDK is failed: ${e.message}"
      )
      checkoutFailed(exception)
      promise.reject(exception.errorType.name, exception.description, e)
    }
  }

  @ReactMethod
  fun showVaultManager(promise: Promise) {
    val exception = PrimerErrorRN(
      ErrorTypeRN.CheckoutFlowFailed,
      "This method not implemented, please use showVaultManager with client Token"
    )
    checkoutFailed(exception)
    promise.reject(exception.errorType.name, exception.description)
  }

  @ReactMethod
  fun showVaultManager(clientToken: String, promise: Promise) {
    try {
      Primer.instance.showVaultManager(reactApplicationContext.applicationContext, clientToken)
      promise.resolve(null)
    } catch (e: Exception) {
      val exception = PrimerErrorRN(
        ErrorTypeRN.CheckoutFlowFailed,
        "Call of Primer SDK is failed: ${e.message}"
      )
      checkoutFailed(exception)
      promise.reject(exception.errorType.name, exception.description, e)
    }
  }

  @ReactMethod
  fun showPaymentMethod(
    clientToken: String,
    paymentMethodTypeStr: String,
    intentStr: String,
    promise: Promise
  ) {
    try {
      this.intent = PaymentMethodIntent.valueOf(intentStr)
    } catch (e: Exception) {
      val exception = PrimerErrorRN(
        ErrorTypeRN.ParseJsonFailed,
        "failed to parse intent."
      )
      checkoutFailed(exception)
      promise.reject(exception.errorType.name, exception.description, e)
      return
    }
    try {
      val paymentMethod = PrimerPaymentMethod.valueOf(paymentMethodTypeStr)
      this.paymentMethod = paymentMethod
    } catch (e: Exception) {
      val exception = PrimerErrorRN(
        ErrorTypeRN.CheckoutFlowFailed,
        "failed to parse payment method type."
      )
      checkoutFailed(exception)
      promise.reject(exception.errorType.name, exception.description, e)
      return
    }

    try {
      val paymentMethod = this.paymentMethod ?: return
      val intent = this.intent ?: return
      Primer.instance.showPaymentMethod(
        reactApplicationContext.applicationContext,
        clientToken,
        paymentMethod,
        intent
      )
      promise.resolve(null)
    } catch (e: Exception) {
      val exception = PrimerErrorRN(
        ErrorTypeRN.CheckoutFlowFailed,
        "Call of Primer SDK is failed: ${e.message}"
      )
      checkoutFailed(exception)
      promise.reject(exception.errorType.name, exception.description, e)
    }
  }

  @ReactMethod
  fun handleNewClientToken(clientToken: String, promise: Promise) {
    mListener.onClientTokenCallback(clientToken, null)
    mListener.onClientSessionActions(clientToken, null)
    mListener.onTokenizeSuccess(clientToken, null)
    mListener.onResumeSuccess(clientToken, null)
    removeCallbacksAndHandlers()
    promise.resolve(null)
  }

  @ReactMethod
  fun handleError(errorStr: String, promise: Promise) {
    try {
      val err = Error(errorStr)
      mListener.onClientTokenCallback(null, err)
      mListener.onClientSessionActions(null, err)
      mListener.onTokenizeSuccess(null, err)
      mListener.onResumeSuccess(null, err)
      removeCallbacksAndHandlers()
      promise.resolve(null)
    } catch (e: Exception) {
      val exception = PrimerErrorRN(
        ErrorTypeRN.CheckoutFlowFailed,
        "Call of Primer SDK is failed: ${e.message}"
      )
      checkoutFailed(exception)
      promise.reject(exception.errorType.name, exception.description, e)
    }
  }

  @ReactMethod
  fun handleSuccess(promise: Promise) {
    try {
      mListener.onClientTokenCallback(null, null)
      mListener.onClientSessionActions(null, null)
      mListener.onTokenizeSuccess(null, null)
      mListener.onResumeSuccess(null, null)
      removeCallbacksAndHandlers()
      promise.resolve(null)
    } catch (e: Exception) {
      val exception = PrimerErrorRN(
        ErrorTypeRN.CheckoutFlowFailed,
        "Call of Primer SDK is failed: ${e.message}"
      )
      checkoutFailed(exception)
      promise.reject(exception.errorType.name, exception.description, e)
    }
  }

  @ReactMethod
  fun setImplementedRNCallbacks(implementedRNCallbacksStr: String, promise: Promise) {
    try {
      Log.d(
        javaClass.simpleName,
        "Method not implemented on Android SDK part of RN ($implementedRNCallbacksStr)"
      )
      promise.resolve(null)
    } catch (e: Exception) {
      val exception = PrimerErrorRN(
        ErrorTypeRN.CheckoutFlowFailed,
        "Call of Primer SDK is failed: ${e.message}"
      )
      checkoutFailed(exception)
      promise.reject(exception.errorType.name, exception.description, e)
    }
  }

  private fun removeCallbacksAndHandlers() {
    mListener.removeCallbacksAndHandlers()
  }

  private fun startSdk() {
    val theme = theme.format()
    val settings = settings.format()
    val config = PrimerConfig(theme, settings)

    Primer.instance.configure(config, mListener)
    sdkWasInitialised = true
    sendEvent(PrimerEventsRN.OnClientTokenCallback.string, null)
  }

  private fun checkoutFailed(exception: PrimerErrorRN) {
    val params = Arguments.createMap()
    params.putString(Keys.ERROR, exception.description)
    sendEvent(exception.errorType.name, params)
  }

  private fun sendEvent(name: String, params: WritableMap) {
    reactApplicationContext.getJSModule(
      DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
    ).emit(name, params)
  }

  private fun sendEvent(name: String, paramsJson: String?) {
    reactApplicationContext.getJSModule(
      DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
    ).emit(name, paramsJson)
  }
}

internal object Keys {
  const val ERROR = "error"
  const val RESUME_TOKEN = "resumeToken"
}
