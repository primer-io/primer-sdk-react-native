package com.primerioreactnative

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.datamodels.*
import com.primerioreactnative.utils.PrimerImplementedRNCallbacks
import com.primerioreactnative.utils.errorTo
import io.primer.android.Primer
import io.primer.android.PrimerSessionIntent
import io.primer.android.data.configuration.models.PrimerPaymentMethodType
import io.primer.android.data.settings.PrimerSettings
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject


class PrimerRN(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private var mListener = PrimerRNEventListener()
  private val json = Json { ignoreUnknownKeys = true }

  init {
    mListener.sendEvent = { eventName, paramsJson -> sendEvent(eventName, paramsJson) }
    mListener.sendError = { paramsJson -> checkoutFailed(paramsJson) }
  }

  override fun getName(): String = "NativePrimer"

  @ReactMethod
  fun configure(settingsStr: String, promise: Promise) {
    try {
      Log.d("PrimerRN", "settings: $settingsStr")
      val settings = json.decodeFromString<PrimerSettingsRN>(settingsStr)
      startSdk(settings.toPrimerSettings())
      promise.resolve(null)
    } catch (e: Exception) {
      Log.e("PrimerRN", "configure settings error: $e")
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo "failed to parse settings."
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.description, e)
    }
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
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo
        "Primer SDK failed: ${e.message}"
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.description, e)
    }
  }


  @ReactMethod
  fun showVaultManagerWithToken(clientToken: String, promise: Promise) {
    try {
      Primer.instance.showVaultManager(reactApplicationContext.applicationContext, clientToken)
      promise.resolve(null)
    } catch (e: Exception) {
      val exception = ErrorTypeRN.CheckoutFlowFailed errorTo
        "Primer SDK failed: ${e.message}"
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.description, e)
    }
  }

  @ReactMethod
  fun showPaymentMethod(
    clientToken: String,
    paymentMethodTypeStr: String,
    intentStr: String,
    promise: Promise
  ) {
    val intent: PrimerSessionIntent
    try {
      intent = PrimerSessionIntent.valueOf(intentStr)
    } catch (e: Exception) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo "Intent $intentStr is not valid."
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.description, e)
      return
    }
    val paymentMethod: PrimerPaymentMethodType
    try {
      paymentMethod = PrimerPaymentMethodType.valueOf(paymentMethodTypeStr)
    } catch (e: Exception) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo "Payment method type $paymentMethodTypeStr is not valid."
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.description, e)
      return
    }

    try {
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
      promise.reject(exception.errorId, exception.description, e)
    }
  }

  @ReactMethod
  fun dismiss(promise: Promise) {
    Primer.instance.dismiss()
    promise.resolve(null)
  }

  // region tokenization handlers
  @ReactMethod
  fun handleTokenizationNewClientToken(newClientToken: String, promise: Promise) {
    mListener.handleTokenizationNewClientToken(newClientToken)
    promise.resolve(null)
  }

  @ReactMethod
  fun handleTokenizationSuccess(promise: Promise) {
    mListener.handleTokenizationSuccess()
    promise.resolve(null)
  }

  @ReactMethod
  fun handleTokenizationFailure(errorMessage: String?, promise: Promise) {
    mListener.handleTokenizationFailure(errorMessage.orEmpty())
    promise.resolve(null)
  }
  // endregion

  // region resume handlers
  @ReactMethod
  fun handleResumeNewClientToken(newClientToken: String, promise: Promise) {
    mListener.handleResumeNewClientToken(newClientToken)
    promise.resolve(null)
  }

  @ReactMethod
  fun handleResumeSuccess(promise: Promise) {
    mListener.handleResumeSuccess()
    promise.resolve(null)
  }

  @ReactMethod
  fun handleResumeFailure(errorMessage: String?, promise: Promise) {
    mListener.handleResumeFailure(errorMessage.orEmpty())
    promise.resolve(null)
  }
  // endregion

  // region payment handlers
  @ReactMethod
  fun handlePaymentCreationContinue(promise: Promise) {
    mListener.handlePaymentCreationContinue()
    promise.resolve(null)
  }

  @ReactMethod
  fun handlePaymentCreationAbort(errorMessage: String?, promise: Promise) {
    mListener.handlePaymentCreationAbort(errorMessage.orEmpty())
    promise.resolve(null)
  }
  // endregion

  // region error handlers
  @ReactMethod
  fun handleErrorMessage(errorMessage: String?, promise: Promise) {
    mListener.handleErrorMessage(errorMessage.orEmpty())
    promise.resolve(null)
  }
  // endregion

  @ReactMethod
  fun setImplementedRNCallbacks(implementedRNCallbacksStr: String, promise: Promise) {
    try {
      Log.d("PrimerRN", "implementedRNCallbacks: $implementedRNCallbacksStr")
      val implementedRNCallbacks =
        json.decodeFromString<PrimerImplementedRNCallbacks>(implementedRNCallbacksStr)
      this.mListener.setImplementedCallbacks(implementedRNCallbacks)
      promise.resolve(null)
    } catch (e: Exception) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo "Implemented callbacks $implementedRNCallbacksStr is not valid."
      checkoutFailed(exception)
      promise.reject(exception.errorId, exception.description, e)
    }
  }

  private fun startSdk(settings: PrimerSettings) {
    Primer.instance.configure(settings, mListener)
  }

  private fun checkoutFailed(exception: PrimerErrorRN) {
    val params = Arguments.createMap()
    val errorJson = JSONObject(Json.encodeToString(exception))
    val data = Arguments.createMap()
    prepareData(data, errorJson)
    params.putMap(Keys.ERROR, data)
    sendEvent(PrimerEvents.ON_CHECKOUT_FAIL.eventName, params)
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
