package com.primerioreactnative.components.manager.raw

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.Keys
import com.primerioreactnative.components.datamodels.core.PrimerRawPaymentMethodType
import com.primerioreactnative.components.datamodels.manager.raw.card.PrimerRNRawCardData
import com.primerioreactnative.components.datamodels.manager.raw.cardRedirect.PrimerRNRawBancontactCardData
import com.primerioreactnative.components.datamodels.manager.raw.phoneNumber.PrimerRNRawPhoneNumberData
import com.primerioreactnative.components.datamodels.manager.raw.retailOutlets.PrimerRNRawRetailOutletData
import com.primerioreactnative.components.datamodels.manager.raw.retailOutlets.toRNRetailOutletsList
import com.primerioreactnative.components.events.PrimerHeadlessUniversalCheckoutEvent
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.PrimerErrorRN
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.errorTo
import io.primer.android.ExperimentalPrimerApi
import io.primer.android.components.manager.raw.PrimerHeadlessUniversalCheckoutRawDataManager
import io.primer.android.components.manager.raw.PrimerHeadlessUniversalCheckoutRawDataManagerInterface
import io.primer.android.data.payments.configure.retailOutlets.RetailOutletsList
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

  override fun getName() = "RNTPrimerHeadlessUniversalCheckoutRawDataManager"

  @ReactMethod
  fun configure(paymentMethodTypeStr: String, promise: Promise) {
    try {
      rawManager = PrimerHeadlessUniversalCheckoutRawDataManager.newInstance(
        paymentMethodTypeStr
      )
      this.paymentMethodTypeStr = paymentMethodTypeStr
      rawManager.setListener(listener)
      rawManager.configure { primerInitializationData, error ->
        if (error == null) {
          when (primerInitializationData) {
            is RetailOutletsList -> {
              promise.resolve(
                prepareData(
                  JSONObject(
                    Json.encodeToString(
                      primerInitializationData.toRNRetailOutletsList()
                    )
                  )
                )
              )
            }
            else -> promise.resolve(null)
          }
        } else promise.reject(error.errorId, error.description)
      }
    } catch (e: Exception) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo e.message.orEmpty()
      promise.reject(exception.errorId, exception.description, e)
    }
  }

  @ReactMethod
  fun listRequiredInputElementTypesForPaymentMethodType(
    paymentMethodTypeStr: String,
    promise: Promise
  ) {
    if (::rawManager.isInitialized.not()) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
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
        ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      try {
        val rawData = when (PrimerRawPaymentMethodType.valueOf(paymentMethodTypeStr.toString())) {
          PrimerRawPaymentMethodType.PAYMENT_CARD -> json.decodeFromString<PrimerRNRawCardData>(
            rawDataStr
          ).toPrimerCardData()
          PrimerRawPaymentMethodType.XENDIT_OVO,
          PrimerRawPaymentMethodType.ADYEN_MBWAY ->
            json.decodeFromString<PrimerRNRawPhoneNumberData>(rawDataStr)
              .toPrimerRawPhoneNumberData()
          PrimerRawPaymentMethodType.ADYEN_BANCONTACT_CARD ->
            json.decodeFromString<PrimerRNRawBancontactCardData>(rawDataStr)
              .toPrimerRawBancontactCardData()
          PrimerRawPaymentMethodType.XENDIT_RETAIL_OUTLETS ->
            json.decodeFromString<PrimerRNRawRetailOutletData>(rawDataStr)
              .toPrimerRawRetailOutletData()
        }
        rawManager.setRawData(rawData)
        promise.resolve(null)
      } catch (e: Exception) {
        val exception =
          ErrorTypeRN.NativeBridgeFailed errorTo "Failed to decode $rawDataStr on Android." +
            " Make sure you're providing a valid 'RawData' (or any inherited) object."
        onError(exception)
        promise.reject(exception.errorId, exception.description, e)
      }
    }
  }

  @ReactMethod
  fun submit(promise: Promise) {
    if (::rawManager.isInitialized.not()) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      rawManager.submit()
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun dispose(promise: Promise) {
    if (::rawManager.isInitialized.not()) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
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

  private companion object {
    const val UNINITIALIZED_ERROR =
      """
        The RawDataManager has not been initialized.
        Make sure you have initialized the `RawDataManager' first.
      """
  }
}
