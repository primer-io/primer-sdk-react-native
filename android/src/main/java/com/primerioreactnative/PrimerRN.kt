package com.primerioreactnative

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.datamodels.*
import com.primerioreactnative.utils.PrimerImplementedRNCallbacks
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.errorTo
import io.primer.android.Primer
import io.primer.android.data.settings.PrimerSettings
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

class PrimerRN(reactContext: ReactApplicationContext, private val json: Json) :
  ReactContextBaseJavaModule(reactContext) {
  private var mListener = PrimerRNEventListener()

  init {
    mListener.sendEvent = { eventName, paramsJson -> sendEvent(eventName, paramsJson) }
    mListener.sendError = { paramsJson -> onError(paramsJson) }
    mListener.sendErrorWithCheckoutData =
      { paramsJson, checkoutData -> onError(paramsJson, checkoutData) }
    mListener.onDismissedEvent = { Primer.instance.dismiss(true) }
  }

  override fun getName(): String = "NativePrimer"

  @ReactMethod
  fun configure(settingsStr: String, promise: Promise) {
    try {
      Log.d("PrimerRN", "settings: $settingsStr")
      val settings =
        if (settingsStr.isBlank()) PrimerSettingsRN() else json.decodeFromString(
          settingsStr
        )
      startSdk(settings.toPrimerSettings())
      promise.resolve(null)
    } catch (e: Exception) {
      Log.e("PrimerRN", "configure settings error: $e")
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo "failed to parse settings."
      onError(exception)
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
      onError(exception)
      promise.reject(exception.errorId, exception.description, e)
    }
  }

  @ReactMethod
  fun showVaultManagerWithClientToken(clientToken: String, promise: Promise) {
    try {
      Primer.instance.showVaultManager(reactApplicationContext.applicationContext, clientToken)
      promise.resolve(null)
    } catch (e: Exception) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo
        "Primer SDK failed: ${e.message}"
      onError(exception)
      promise.reject(exception.errorId, exception.description, e)
    }
  }

  @ReactMethod
  fun dismiss(promise: Promise) {
    Primer.instance.dismiss(true)
    promise.resolve(null)
  }

  @ReactMethod
  fun dispose(promise: Promise) {
    Primer.instance.dismiss(true)
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
  fun showErrorMessage(errorMessage: String?, promise: Promise) {
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
      onError(exception)
      promise.reject(exception.errorId, exception.description, e)
    }
  }

  private fun startSdk(settings: PrimerSettings) {
    Primer.instance.configure(settings, mListener)
  }

  private fun onError(exception: PrimerErrorRN, checkoutDataRN: PrimerCheckoutDataRN? = null) {
    val params = Arguments.createMap()
    val errorJson = JSONObject(Json.encodeToString(exception))
    val errorData = prepareData(errorJson)
    params.putMap(Keys.ERROR, errorData)
    checkoutDataRN?.let {
      val checkoutDataJson = JSONObject(Json.encodeToString(it))
      val checkoutData = prepareData(checkoutDataJson)
      params.putMap(Keys.CHECKOUT_DATA, checkoutData)
    }
    sendEvent(PrimerEvents.ON_ERROR.eventName, params)
  }

  private fun sendEvent(name: String, params: WritableMap) {
    reactApplicationContext.getJSModule(
      DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
    ).emit(name, params)
  }

  private fun sendEvent(name: String, data: JSONObject?) {
    val params = prepareData(data)
    reactApplicationContext.getJSModule(
      DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
    ).emit(name, params)
  }

  private fun prepareData(data: JSONObject?): WritableMap {
    return data?.let { convertJsonToMap(data) } ?: Arguments.createMap()
  }
}

internal object Keys {
  const val ERROR = "error"
  const val RESUME_TOKEN = "resumeToken"
  const val CHECKOUT_DATA = "checkoutData"
  const val ADDITIONAL_INFO = "additionalInfo"
}
