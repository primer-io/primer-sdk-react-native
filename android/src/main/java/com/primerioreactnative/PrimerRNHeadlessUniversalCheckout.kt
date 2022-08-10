package com.primerioreactnative

import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.datamodels.*
import com.primerioreactnative.huc.assets.AssetsManager
import com.primerioreactnative.huc.assets.AssetsManager.drawableToBitmap
import com.primerioreactnative.huc.assets.AssetsManager.getFile
import com.primerioreactnative.huc.events.PrimerHeadlessUniversalCheckoutEvent
import com.primerioreactnative.utils.PrimerHeadlessUniversalCheckoutImplementedRNCallbacks
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.errorTo
import io.primer.android.ExperimentalPrimerApi
import io.primer.android.components.PrimerHeadlessUniversalCheckout
import io.primer.android.components.ui.assets.ImageType
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
    errorCallback: Callback,
    successCallback: Callback
  ) {
    listener.successCallback = successCallback
    try {
      val settings =
        if (settingsStr.isNullOrBlank()) PrimerSettingsRN() else json.decodeFromString(
          settingsStr
        )
      PrimerHeadlessUniversalCheckout.current.start(
        reactContext,
        clientToken,
        settings.toPrimerSettings(),
        listener
      )
    } catch (e: Exception) {
      errorCallback.invoke(
        json.encodeToString(
          ErrorTypeRN.NativeBridgeFailed errorTo
            "failed to initialise PrimerHeadlessUniversalCheckout SDK, error: $e",
        )
      )
    }
  }

  @ReactMethod
  fun showPaymentMethod(paymentMethodTypeStr: String, promise: Promise) {
    PrimerHeadlessUniversalCheckout.current.showPaymentMethod(
      reactContext,
      paymentMethodTypeStr
    )
    promise.resolve(null)
  }

  @ReactMethod
  fun disposePrimerHeadlessUniversalCheckout() {
    PrimerHeadlessUniversalCheckout.current.cleanup()
    listener.removeCallbacksAndHandlers()
  }

  @ReactMethod
  fun getAssetForPaymentMethodType(
    paymentMethodType: String,
    assetType: String,
    errorCallback: Callback,
    successCallback: Callback
  ) {

    val type = ImageType.values().find { it.name.equals(assetType, ignoreCase = true) }
    when {
      type == null -> {
        errorCallback.invoke(
          json.encodeToString(
            ErrorTypeRN.AssetMismatch errorTo
              "You have provided assetType=$assetType, but variable assetType can be 'LOGO' or 'ICON'."
          )
        )
      }
      else -> {
        PrimerHeadlessUniversalCheckout.getAsset(paymentMethodType, type)?.let { resourceId ->
          val file = getFile(reactContext, paymentMethodType)
          AssetsManager.saveBitmapToFile(
            file,
            drawableToBitmap(ContextCompat.getDrawable(reactContext, resourceId)!!),
          )
          successCallback.invoke("file://${file.absolutePath}")
        } ?: run {
          errorCallback.invoke(
            json.encodeToString(
              ErrorTypeRN.AssetMissing errorTo
                "Failed to find $assetType for $paymentMethodType"
            )
          )
        }
      }
    }
  }

  // region tokenization handlers
  @ReactMethod
  fun handleTokenizationNewClientToken(newClientToken: String, promise: Promise) {
    listener.handleTokenizationNewClientToken(newClientToken)
    promise.resolve(null)
  }

  @ReactMethod
  fun handleTokenizationSuccess(promise: Promise) {
    listener.handleTokenizationSuccess(promise)
  }

  @ReactMethod
  fun handleTokenizationFailure(errorMessage: String?, promise: Promise) {
    listener.handleTokenizationFailure(errorMessage.orEmpty(), promise)
  }
  // endregion

  // region resume handlers
  @ReactMethod
  fun handleResumeNewClientToken(newClientToken: String, promise: Promise) {
    listener.handleResumeNewClientToken(newClientToken)
    promise.resolve(null)
  }

  @ReactMethod
  fun handleResumeSuccess(promise: Promise) {
    listener.handleResumeSuccess(promise)
  }

  @ReactMethod
  fun handleResumeFailure(errorMessage: String?, promise: Promise) {
    listener.handleResumeFailure(errorMessage.orEmpty(), promise)
  }
  // endregion

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
