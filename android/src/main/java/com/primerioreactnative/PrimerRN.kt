package com.primerioreactnative

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.datamodels.*
import com.primerioreactnative.utils.PrimerImplementedRNCallbacks
import com.primerioreactnative.utils.errorTo
import io.primer.android.PaymentMethodIntent
import io.primer.android.Primer
import io.primer.android.model.dto.PrimerConfig
import io.primer.android.model.dto.PrimerPaymentMethod
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

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
    mListener.sendError = { paramsJson -> checkoutFailed(paramsJson) }
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
      val exception = ErrorTypeRN.ParseJsonFailed errorTo "failed to parse settings."
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.errorDescription, e)
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
      val exception = ErrorTypeRN.ParseJsonFailed errorTo "failed to parse theme."
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.errorDescription, e)
    }
  }

  @ReactMethod
  fun showUniversalCheckout(promise: Promise) {
    val exception = ErrorTypeRN.CheckoutFlowFailed errorTo
      "This method is deprecated. Use the new showUniversalCheckoutWithClientToken method"
    checkoutFailed(exception)
    promise.reject(exception.errorId, exception.errorDescription)
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
      val exception = ErrorTypeRN.CheckoutFlowFailed errorTo
        "Primer SDK failed: ${e.message}"
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.errorDescription, e)
    }
  }

  @ReactMethod
  fun showVaultManager(promise: Promise) {
    val exception = ErrorTypeRN.CheckoutFlowFailed errorTo
      "This method is deprecated. Use the new showUniversalCheckoutWithClientToken method"
    checkoutFailed(exception)
    promise.reject(exception.errorId, exception.errorDescription)
  }

  @ReactMethod
  fun showVaultManager(clientToken: String, promise: Promise) {
    try {
      Primer.instance.showVaultManager(reactApplicationContext.applicationContext, clientToken)
      promise.resolve(null)
    } catch (e: Exception) {
      val exception = ErrorTypeRN.CheckoutFlowFailed errorTo
        "Primer SDK failed: ${e.message}"
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.errorDescription, e)
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
      val exception = ErrorTypeRN.ParseJsonFailed errorTo "failed to parse intent."
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.errorDescription, e)
      return
    }
    try {
      val paymentMethod = PrimerPaymentMethod.valueOf(paymentMethodTypeStr)
      this.paymentMethod = paymentMethod
    } catch (e: Exception) {
      val exception = ErrorTypeRN.CheckoutFlowFailed errorTo "failed to parse payment method type."
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.errorDescription, e)
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
      val exception = ErrorTypeRN.CheckoutFlowFailed errorTo
        "Primer SDK failed: ${e.message}"
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.errorDescription, e)
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
      val err = json.decodeFromString<PrimerErrorRN>(errorStr)
      mListener.onClientTokenCallback(null, err)
      mListener.onClientSessionActions(null, err)
      mListener.onTokenizeSuccess(null, err)
      mListener.onResumeSuccess(null, err)
      removeCallbacksAndHandlers()
      promise.resolve(null)
    } catch (e: Exception) {
      val exception = PrimerErrorRN(
        ErrorTypeRN.CheckoutFlowFailed.name,
        "Primer SDK failed: ${e.message}"
      )
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.errorDescription, e)
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
      val exception = ErrorTypeRN.CheckoutFlowFailed errorTo
        "Primer SDK failed: ${e.message}"
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.errorDescription, e)
    }
  }

  @ReactMethod
  fun setImplementedRNCallbacks(implementedRNCallbacksStr: String, promise: Promise) {
    try {
      Log.d("PrimerRN", "implementedRNCallbacks: $implementedRNCallbacksStr")
      val implementedRNCallbacks =
        json.decodeFromString<PrimerImplementedRNCallbacks>(implementedRNCallbacksStr)
      this.mListener.setImplementedCallbacks(implementedRNCallbacks)
      promise.resolve(null)
    } catch (e: Exception) {
      val exception = ErrorTypeRN.ParseJsonFailed errorTo "Failed to parse implemented callbacks"
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.errorDescription, e)
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
  }

  private fun checkoutFailed(exception: PrimerErrorRN) {
    val params = Arguments.createMap()
    val errorJson = JSONObject(Json.encodeToString(exception))
    val data = Arguments.createMap()
    prepareData(data, errorJson)
    params.putMap(Keys.ERROR, data)
    sendEvent(PrimerEventsRN.OnError.string, params)
  }

  private fun sendEvent(name: String, params: WritableMap) {
    reactApplicationContext.getJSModule(
      DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
    ).emit(name, params)
  }

  private fun sendEvent(name: String, data: JSONObject?) {
    val params = Arguments.createMap()
    prepareData(params, data)
    reactApplicationContext.getJSModule(
      DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
    ).emit(name, params)
  }

  private fun prepareData(params: WritableMap, data: JSONObject?) {
    data?.keys()?.forEach { key ->
      when (val dataValue = data.opt(key)) {
        is String -> params.putString(key, dataValue)
        is Boolean -> params.putBoolean(key, dataValue)
        is Double -> params.putDouble(key, dataValue)
        is Int -> params.putInt(key, dataValue)
        is JSONObject -> prepareData(params, dataValue)
        else -> params.putNull(key)
      }
    }
  }
}

internal object Keys {
  const val ERROR = "error"
  const val RESUME_TOKEN = "resumeToken"
}
