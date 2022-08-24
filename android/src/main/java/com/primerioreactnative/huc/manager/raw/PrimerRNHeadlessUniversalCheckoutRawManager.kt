package com.primerioreactnative.huc.manager.raw

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.Keys
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.PrimerErrorRN
import com.primerioreactnative.huc.datamodels.manager.raw.card.PrimerRNPRawCardData
import com.primerioreactnative.huc.datamodels.manager.raw.phoneNumber.PrimerRNRawPhoneNumberData
import com.primerioreactnative.huc.events.PrimerHeadlessUniversalCheckoutEvent
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.errorTo
import io.primer.android.ExperimentalPrimerApi
import io.primer.android.components.manager.raw.PrimerHeadlessUniversalCheckoutRawDataManager
import io.primer.android.components.manager.raw.PrimerHeadlessUniversalCheckoutRawDataManagerInterface
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject

@ExperimentalPrimerApi
internal class PrimerRNHeadlessUniversalCheckoutRawManager(
  reactContext: ReactApplicationContext,
  private val json: Json,
) : ReactContextBaseJavaModule(reactContext) {

  private val listener = PrimerRNHeadlessUniversalCheckoutRawManagerListener()
  private lateinit var rawManager: PrimerHeadlessUniversalCheckoutRawDataManagerInterface
  private var paymentMethodTypeStr: String? = null

  init {
    listener.sendEvent = { eventName, paramsJson -> sendEvent(eventName, paramsJson) }
  }

  override fun getName() = "PrimerHeadlessUniversalCheckoutRawDataManager"

  @ReactMethod
  fun initialize(paymentMethodTypeStr: String, promise: Promise) {
    try {
      rawManager = PrimerHeadlessUniversalCheckoutRawDataManager.newInstance(
        paymentMethodTypeStr
      )
      this.paymentMethodTypeStr = paymentMethodTypeStr
      rawManager.setManagerListener(listener)
      promise.resolve(null)
    } catch (e: Exception) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo e.message.orEmpty()
      promise.reject(exception.errorId, exception.description)
    }
  }

  @ReactMethod
  fun listRequiredInputElementTypesForPaymentMethodType(
    paymentMethodTypeStr: String,
    promise: Promise
  ) {
    if (::rawManager.isInitialized.not()) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo "The PrimerHeadlessUniversalCheckoutRawDataManager" +
          " has not been initialized. Make sure you have called the" +
          " HeadlessUniversalCheckoutRawDataManager.configure function first."
      promise.reject(exception.errorId, exception.description)
    } else {
      promise.resolve(
        prepareData(
          JSONObject().apply {
            put(
              "inputElementTypes",
              JSONArray(rawManager.getRequiredInputElementTypes().map { it.name })
            )
          }
        )
      )
    }
  }

  @ReactMethod
  fun setRawData(rawDataStr: String, promise: Promise) {
    if (::rawManager.isInitialized.not()) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo "The PrimerHeadlessUniversalCheckoutRawDataManager" +
          " has not been initialized. Make sure you have called the" +
          " HeadlessUniversalCheckoutRawDataManager.configure function first."
      promise.reject(exception.errorId, exception.description)
    } else {
      try {
        val rawData = when (paymentMethodTypeStr) {
          "PAYMENT_CARD" -> json.decodeFromString<PrimerRNPRawCardData>(
            rawDataStr
          ).toPrimerCardData()
          "XENDIT_OVO" -> json.decodeFromString<PrimerRNRawPhoneNumberData>(
            rawDataStr
          ).toPrimerRawPhoneNumberData()
          else -> throw IllegalArgumentException("")
        }
        rawManager.setRawData(rawData)
        promise.resolve(null)
      } catch (e: Exception) {
        val exception =
          ErrorTypeRN.NativeBridgeFailed errorTo "Failed to decode $rawDataStr on Android." +
            " Make sure you're providing a valid object"
        onError(exception)
        promise.reject(exception.errorId, exception.description, e)
      }
    }
  }

  @ReactMethod
  fun submit(promise: Promise) {
    if (::rawManager.isInitialized.not()) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo "The PrimerHeadlessUniversalCheckoutRawDataManager" +
          " has not been initialized. Make sure you have called the" +
          " HeadlessUniversalCheckoutRawDataManager.configure function first."
      promise.reject(exception.errorId, exception.description)
    } else {
      rawManager.submit()
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun disposeRawDataManager(promise: Promise) {
    if (::rawManager.isInitialized.not()) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo "The PrimerHeadlessUniversalCheckoutRawDataManager" +
          " has not been initialized. Make sure you have called the" +
          " HeadlessUniversalCheckoutRawDataManager.configure function first."
      promise.reject(exception.errorId, exception.description)
    } else {
      rawManager.cleanup()
      promise.resolve(null)
    }
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

  private fun onError(exception: PrimerErrorRN) {
    val params = Arguments.createMap()
    val errorJson = JSONObject(Json.encodeToString(exception))
    val errorData = prepareData(errorJson)
    params.putMap(Keys.ERROR, errorData)
    sendEvent(PrimerHeadlessUniversalCheckoutEvent.ON_ERROR.eventName, params)
  }
}
