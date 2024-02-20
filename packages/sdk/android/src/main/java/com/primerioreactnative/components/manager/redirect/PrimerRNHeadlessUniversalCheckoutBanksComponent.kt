package com.primerioreactnative.components.manager.redirect

import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.lifecycleScope
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.PrimerRNViewModelStoreOwner
import com.primerioreactnative.components.events.PrimerHeadlessUniversalCheckoutRedirectManagerEvent
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.PrimerValidationErrorRN
import com.primerioreactnative.datamodels.redirect.toBankIdRN
import com.primerioreactnative.datamodels.redirect.toFilterRN
import com.primerioreactnative.datamodels.NamedComponentStep
import com.primerioreactnative.extensions.toPrimerErrorRN
import com.primerioreactnative.extensions.toPrimerIssuingBankRN
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.convertJsonToArray
import com.primerioreactnative.utils.errorTo
import io.primer.android.components.manager.banks.composable.BanksCollectableData
import io.primer.android.components.manager.banks.composable.BanksStep
import io.primer.android.components.manager.componentWithRedirect.PrimerHeadlessUniversalCheckoutComponentWithRedirectManager
import io.primer.android.components.manager.componentWithRedirect.component.BanksComponent
import io.primer.android.components.manager.core.composable.PrimerValidationStatus
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject

class PrimerRNHeadlessUniversalCheckoutBanksComponent(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNTPrimerHeadlessUniversalCheckoutBanksComponent"

  private var job: Job? = null
  private var banksComponent: BanksComponent? = null
  private var viewModelStoreOwner: ViewModelStoreOwner? = null

  @ReactMethod
  fun configure(paymentMethodType: String, promise: Promise) {

    val currentViewModelStoreOwner =
        reactContext.currentActivity as? ViewModelStoreOwner
            ?: run { PrimerRNViewModelStoreOwner() }

    viewModelStoreOwner = currentViewModelStoreOwner
    banksComponent =
        PrimerHeadlessUniversalCheckoutComponentWithRedirectManager(currentViewModelStoreOwner)
            .provide<BanksComponent>(paymentMethodType = paymentMethodType)

    val lifecycleScope =
        (reactContext.currentActivity as? LifecycleOwner)?.lifecycleScope
            ?: CoroutineScope(SupervisorJob() + Dispatchers.Main)

    job =
        lifecycleScope.launch {
          if (banksComponent == null) {
            val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
            promise.reject(exception.errorId, exception.description)
          } else {
            coroutineScope {
              launch { configureBanksListener() }

              launch { configureValidationListener() }

              launch { configureErrorListener() }
              promise.resolve(null)
            }
          }
        }
  }

  @ReactMethod
  fun start(promise: Promise) {
    if (banksComponent == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      banksComponent?.start()
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun submit(promise: Promise) {
    if (banksComponent == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      banksComponent?.submit()
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun onBankSelected(bankId: String, promise: Promise) {
    if (banksComponent == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      banksComponent?.updateCollectedData(BanksCollectableData.BankId(bankId))
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun onBankFilterChange(filter: String, promise: Promise) {
    if (banksComponent == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      banksComponent?.updateCollectedData(BanksCollectableData.Filter(filter))
      promise.resolve(null)
    }
  }

  private suspend fun configureErrorListener() {
    banksComponent?.componentError?.collectLatest { error ->
      sendEvent(
          PrimerHeadlessUniversalCheckoutRedirectManagerEvent.ON_ERROR.eventName,
          JSONObject().apply { 
            put(
              "errors", 
              JSONArray().apply { 
                put(JSONObject(Json.encodeToString(error.toPrimerErrorRN())))
              }
            ) 
          }
      )
    }
  }

  private suspend fun configureBanksListener() {
    banksComponent?.componentStep?.collectLatest { banksStep ->
      when (banksStep) {
        is BanksStep.Loading -> {
          sendEvent(
            PrimerHeadlessUniversalCheckoutRedirectManagerEvent.ON_STEP.eventName,
            JSONObject(Json.encodeToString(NamedComponentStep("loading")))
          )
        }
        is BanksStep.BanksRetrieved -> {
          sendEvent(
            PrimerHeadlessUniversalCheckoutRedirectManagerEvent.ON_STEP.eventName,
            JSONArray(
              Json.encodeToString(banksStep.banks.map { it.toPrimerIssuingBankRN() })
            )
          )
        }
      }
    }
  }

  private suspend fun configureValidationListener() {
    banksComponent?.componentValidationStatus?.collectLatest { validationStatus ->
      when (validationStatus) {
        is PrimerValidationStatus.Validating -> {
          sendEvent(
              PrimerHeadlessUniversalCheckoutRedirectManagerEvent.ON_VALIDATING.eventName,
              JSONObject().apply {
                putData(validationStatus.collectableData as BanksCollectableData)
              }
          )
        }
        is PrimerValidationStatus.Invalid -> {
          sendEvent(
              PrimerHeadlessUniversalCheckoutRedirectManagerEvent.ON_IN_VALID.eventName,
              JSONObject().apply {
                putData(validationStatus.collectableData as BanksCollectableData)
                put(
                    "errors",
                    JSONArray(
                        validationStatus.validationErrors.map {
                          JSONObject(
                              Json.encodeToString(
                                  PrimerValidationErrorRN(
                                      it.errorId,
                                      it.description,
                                      it.diagnosticsId,
                                  )
                              )
                          )
                        }
                    )
                )
              }
          )
        }
        is PrimerValidationStatus.Valid -> {
          sendEvent(
              PrimerHeadlessUniversalCheckoutRedirectManagerEvent.ON_VALID.eventName,
              JSONObject().apply {
                putData(validationStatus.collectableData as BanksCollectableData)
              }
          )
        }
        is PrimerValidationStatus.Error -> {
          sendEvent(
              PrimerHeadlessUniversalCheckoutRedirectManagerEvent.ON_VALIDATION_ERROR.eventName,
              JSONObject().apply {
                putData(validationStatus.collectableData as BanksCollectableData)
                put(
                    "errors",
                    JSONArray().apply { 
                      put(JSONObject(Json.encodeToString(validationStatus.error.toPrimerErrorRN())))
                    }
                )
              }
          )
        }
      }
    }
  }

  private fun JSONObject.putData(collectableData: BanksCollectableData) {
    put(
        "data",
        when (collectableData) {
          is BanksCollectableData.BankId ->
              JSONObject(Json.encodeToString(collectableData.toBankIdRN()))
          is BanksCollectableData.Filter ->
              JSONObject(Json.encodeToString(collectableData.toFilterRN()))
          else -> null
        }
    )
  }

  @ReactMethod fun addListener(eventName: String?) = Unit

  @ReactMethod fun removeListeners(count: Int?) = Unit

  private fun JSONObject?.toWritableMap(): WritableMap =
    this?.let { convertJsonToMap(this) } ?: Arguments.createMap()

  private fun JSONArray?.toWritableArray(): WritableArray =
    this?.let { convertJsonToArray(this) } ?: Arguments.createArray()

  private fun sendEvent(name: String, data: JSONObject?) {
    reactApplicationContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(name, data.toWritableMap())
  }

  private fun sendEvent(name: String, data: JSONArray?) {
    reactApplicationContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(name, data.toWritableArray())
  }

  @ReactMethod
  fun cleanUp(promise: Promise) {
    job?.cancel()
    job = null
    banksComponent = null
    viewModelStoreOwner?.viewModelStore?.clear()
    promise.resolve(null)
  }

  private companion object {
    const val UNINITIALIZED_ERROR =
        """
        The BanksComponent has not been initialized.
        Make sure you have initialized the `BanksComponent` first.
      """
  }
}
