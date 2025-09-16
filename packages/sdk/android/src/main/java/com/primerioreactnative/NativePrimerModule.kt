package com.primerioreactnative

import android.util.Log
import com.facebook.fbreact.specs.NativePrimerSpec
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.PrimerCheckoutDataRN
import com.primerioreactnative.datamodels.PrimerErrorRN
import com.primerioreactnative.datamodels.PrimerEvents
import com.primerioreactnative.datamodels.PrimerSettingsRN
import com.primerioreactnative.datamodels.toPrimerSettings
import com.primerioreactnative.utils.PrimerImplementedRNCallbacks
import com.primerioreactnative.utils.errorTo
import com.primerioreactnative.utils.toWritableMap
import io.primer.android.Primer
import io.primer.android.data.settings.PrimerSettings
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

@Suppress("TooManyFunctions")
class NativePrimerModule(private val reactContext: ReactApplicationContext, private val json: Json) :
  NativePrimerSpec(reactContext) {
  private val mListener = PrimerRNEventListener()

  init {
    mListener.sendEvent = { eventName, paramsJson -> sendEvent(eventName, paramsJson) }
    mListener.sendError = { paramsJson -> onError(paramsJson) }
    mListener.sendErrorWithCheckoutData =
      { paramsJson, checkoutData -> onError(paramsJson, checkoutData) }
    mListener.onDismissedEvent = { Primer.instance.dismiss(true) }

    Log.e("PrimerRN", "inig")
  }

  override fun getName(): String {
    return "RTNPrimer"
  }

  override fun configure(
    settingsStr: String?,
    promise: Promise,
  ) {
    try {
      Log.d("PrimerRN", "settings: $settingsStr")
      val settings =
        if (settingsStr.isNullOrBlank()) {
          PrimerSettingsRN()
        } else {
          json.decodeFromString(
            settingsStr,
          )
        }
      startSdk(settings.toPrimerSettings(reactContext))
      promise.resolve(null)
    } catch (e: Exception) {
      Log.e("PrimerRN", "configure settings error: $e")
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo "failed to parse settings."
      onError(exception)
      promise.reject(exception.errorId, exception.description, e)
    }
  }

  override fun showUniversalCheckoutWithClientToken(
    clientToken: String,
    promise: Promise,
  ) {
    try {
      Primer.instance.showUniversalCheckout(
        reactApplicationContext.applicationContext,
        clientToken
      )
      promise.resolve(null)
    } catch (e: Exception) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo
          "Primer SDK failed: ${e.message}"
      onError(exception)
      promise.reject(exception.errorId, exception.description, e)
    }
  }

  override fun showVaultManagerWithClientToken(
    clientToken: String,
    promise: Promise,
  ) {
    try {
      Primer.instance.showVaultManager(
        reactApplicationContext.applicationContext,
        clientToken
      )
      promise.resolve(null)
    } catch (e: Exception) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo
          "Primer SDK failed: ${e.message}"
      onError(exception)
      promise.reject(exception.errorId, exception.description, e)
    }
  }

  override fun dismiss(promise: Promise) {
    Primer.instance.dismiss(true)
    promise.resolve(null)
  }

  override fun cleanUp(promise: Promise) {
    Primer.instance.dismiss(true)
    promise.resolve(null)
  }

  // region tokenization handlers
  override fun handleTokenizationNewClientToken(
    newClientToken: String,
    promise: Promise,
  ) {
    mListener.handleTokenizationNewClientToken(newClientToken)
    promise.resolve(null)
  }

  override fun handleTokenizationSuccess(promise: Promise) {
    mListener.handleTokenizationSuccess()
    promise.resolve(null)
  }

  override fun handleTokenizationFailure(
    errorMessage: String?,
    promise: Promise,
  ) {
    mListener.handleTokenizationFailure(errorMessage.orEmpty())
    promise.resolve(null)
  }
  // endregion

  // region resume handlers
  override fun handleResumeWithNewClientToken(
    newClientToken: String,
    promise: Promise,
  ) {
    mListener.handleResumeNewClientToken(newClientToken)
    promise.resolve(null)
  }

  override fun handleResumeSuccess(promise: Promise) {
    mListener.handleResumeSuccess()
    promise.resolve(null)
  }

  override fun handleResumeFailure(
    errorMessage: String?,
    promise: Promise,
  ) {
    mListener.handleResumeFailure(errorMessage.orEmpty())
    promise.resolve(null)
  }
  // endregion

  // region payment handlers
  override fun handlePaymentCreationContinue(promise: Promise) {
    mListener.handlePaymentCreationContinue()
    promise.resolve(null)
  }

  override fun handlePaymentCreationAbort(
    errorMessage: String?,
    promise: Promise,
  ) {
    mListener.handlePaymentCreationAbort(errorMessage.orEmpty())
    promise.resolve(null)
  }
  // endregion

  // region error handlers
  override fun showErrorMessage(
    errorMessage: String?,
    promise: Promise,
  ) {
    mListener.handleErrorMessage(errorMessage.orEmpty())
    promise.resolve(null)
  }
  // endregion

  override fun setImplementedRNCallbacks(
    implementedRNCallbacksStr: String,
    promise: Promise,
  ) {
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

  private fun onError(
    exception: PrimerErrorRN,
    checkoutDataRN: PrimerCheckoutDataRN? = null,
  ) {
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

  private fun sendEvent(
    name: String,
    params: WritableMap,
  ) {
    emitOnEventSent(params)
  }

  private fun sendEvent(
    name: String,
    data: JSONObject?,
  ) {
    val params = prepareData(data)

    emitOnEventSent(params)
  }

  private fun prepareData(data: JSONObject?): WritableMap {
    return data.toWritableMap()
  }
}

internal object Keys {
  const val ERROR = "error"
  const val RESUME_TOKEN = "resumeToken"
  const val CHECKOUT_DATA = "checkoutData"
  const val ADDITIONAL_INFO = "additionalInfo"
}
