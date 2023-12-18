package com.primerioreactnative

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.datamodels.*
import com.primerioreactnative.components.events.PrimerHeadlessUniversalCheckoutEvent
import com.primerioreactnative.utils.PrimerHeadlessUniversalCheckoutImplementedRNCallbacks
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.errorTo
import io.primer.android.ExperimentalPrimerApi
import io.primer.android.components.PrimerHeadlessUniversalCheckout
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

@ExperimentalPrimerApi
class PrimerRNHeadlessUniversalCheckout(
  private val reactContext: ReactApplicationContext,
  private val json: Json,
) : ReactContextBaseJavaModule(reactContext) {

  private val listener = PrimerRNHeadlessUniversalCheckoutListener()

  init {
    listener.sendEvent = { eventName, paramsJson -> sendEvent(eventName, paramsJson) }
    listener.sendError = { paramsJson -> onError(paramsJson) }
    listener.sendErrorWithCheckoutData =
      { paramsJson, checkoutData -> onError(paramsJson, checkoutData) }
  }

  override fun getName(): String {
    return "PrimerHeadlessUniversalCheckout"
  }

  @ReactMethod
  fun startWithClientToken(
    clientToken: String,
    settingsStr: String?,
    promise: Promise
  ) {
    listener.successCallback = promise
    try {
      val settings =
        if (settingsStr.isNullOrBlank()) PrimerSettingsRN() else json.decodeFromString(
          settingsStr
        )
      PrimerHeadlessUniversalCheckout.current.start(
        reactContext,
        clientToken,
        settings.toPrimerSettings(),
        listener,
        listener
      )
    } catch (e: Exception) {
      promise.reject(
        ErrorTypeRN.NativeBridgeFailed.errorId,
        "failed to initialise PrimerHeadlessUniversalCheckout SDK, error: $e",
      )
    }
  }

  @ReactMethod
  fun cleanUp(promise: Promise) {
    PrimerHeadlessUniversalCheckout.current.cleanup()
    listener.removeCallbacksAndHandlers()
    promise.resolve(null)
  }

  // region tokenization handlers
  @ReactMethod
  fun handleTokenizationNewClientToken(newClientToken: String, promise: Promise) {
    listener.handleTokenizationNewClientToken(newClientToken)
    promise.resolve(null)
  }
  // endregion

  // region resume handlers
  @ReactMethod
  fun handleResumeNewClientToken(newClientToken: String, promise: Promise) {
    listener.handleResumeNewClientToken(newClientToken)
    promise.resolve(null)
  }
  // endregion

  // region complete handlers
  @ReactMethod
  fun handleCompleteFlow(promise: Promise) {
    promise.resolve(null)
  }
  // endregion complete handlers

  // region payment handlers
  @ReactMethod
  fun handlePaymentCreationContinue(promise: Promise) {
    listener.handlePaymentCreationContinue()
    promise.resolve(null)
  }

  @ReactMethod
  fun handlePaymentCreationAbort(errorMessage: String?, promise: Promise) {
    listener.handlePaymentCreationAbort(errorMessage.orEmpty())
    promise.resolve(null)
  }
  // endregion

  @ReactMethod
  fun setImplementedRNCallbacks(implementedRNCallbacksStr: String, promise: Promise) {
    try {
      Log.d(TAG, "implementedRNCallbacks: $implementedRNCallbacksStr")
      val implementedRNCallbacks =
        json.decodeFromString<PrimerHeadlessUniversalCheckoutImplementedRNCallbacks>(
          implementedRNCallbacksStr
        )
      listener.setImplementedCallbacks(implementedRNCallbacks)
      promise.resolve(null)
    } catch (e: Exception) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo "Implemented callbacks $implementedRNCallbacksStr is not valid."
      onError(exception)
      promise.reject(exception.errorId, exception.description, e)
    }
  }

  @ReactMethod
  fun addListener(eventName: String?) = Unit

  @ReactMethod
  fun removeListeners(count: Int?) = Unit

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
    sendEvent(PrimerHeadlessUniversalCheckoutEvent.ON_ERROR.eventName, params)
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

  private companion object {
    const val TAG = "PrimerHUC"
  }
}
