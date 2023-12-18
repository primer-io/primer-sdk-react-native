package com.primerioreactnative.components.manager.redirect

import android.util.Log
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.lifecycleScope
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.components.events.PrimerHeadlessUniversalCheckoutRedirectManagerEvent
import com.primerioreactnative.components.manager.raw.PrimerRNHeadlessUniversalCheckoutRawManager
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.PrimerInputValidationErrorRN
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.errorTo
import io.primer.android.components.SdkUninitializedException
import io.primer.android.components.domain.exception.UnsupportedPaymentMethodManagerException
import io.primer.android.components.manager.banks.composable.BanksCollectableData
import io.primer.android.components.manager.banks.composable.BanksStep
import io.primer.android.components.manager.componentWithRedirect.PrimerHeadlessUniversalCheckoutComponentWithRedirectManager
import io.primer.android.components.manager.componentWithRedirect.component.BanksComponent
import io.primer.android.components.manager.core.composable.PrimerValidationStatus
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject
import kotlinx.coroutines.coroutineScope

class PrimerRNHeadlessUniversalCheckoutComponentWithRedirectManager(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager"

  private var job: Job? = null
  private var banksComponent: BanksComponent? = null

  @ReactMethod
  fun configure(paymentMethodType: String, promise: Promise) {

    val viewModelStoreOwner = reactContext.currentActivity as? ViewModelStoreOwner ?: run {
      promise.reject("ViewModelStoreOwner", "Expected activity class that implement ViewModelStoreOwner")
      return
    }

    banksComponent = PrimerHeadlessUniversalCheckoutComponentWithRedirectManager(viewModelStoreOwner).provide<BanksComponent>(paymentMethodType=paymentMethodType)

    val lifecycleOwner = reactContext.currentActivity as? LifecycleOwner ?: run {
      promise.reject("LifecycleOwner", "Expected activity class that implement LifecycleOwner")
      return
    }

    job = lifecycleOwner.lifecycleScope.launch {
      banksComponent?.start()
      coroutineScope {
        launch {
          configureBanksListener()
        }

        launch {
          configureValidationListener()
        }

        launch {
          configureErrorListener()
        }
        promise.resolve(null)
      }

    }

  }

  @ReactMethod
  fun onBankSelected(bankId: String, promise: Promise) {
    banksComponent?.updateCollectedData(BanksCollectableData.BankId(bankId))
    promise.resolve(null)

  }

  @ReactMethod
  fun onBankFilterChange(filter: String, promise: Promise) {
    banksComponent?.updateCollectedData(BanksCollectableData.Filter(filter))
    promise.resolve(null)
  }

  private suspend fun configureErrorListener() {
    banksComponent?.componentError?.collectLatest { error ->
      Log.e("error",error.toString())
    }
  }

  private suspend fun configureBanksListener() {
    banksComponent?.componentStep?.collectLatest { banksStep ->
        when (banksStep) {
          is BanksStep.Loading -> {
            sendEvent(
              PrimerHeadlessUniversalCheckoutRedirectManagerEvent.ON_RETRIEVING.eventName,
              JSONObject().apply {
                put(
                  "retrieving", "true"
                )
              }
            )
          }
          is BanksStep.BanksRetrieved -> {
            sendEvent(
              PrimerHeadlessUniversalCheckoutRedirectManagerEvent.ON_RETRIEVED.eventName,
              JSONObject().apply {
                put(
                  "banks", JSONArray(
                  Json.encodeToString(banksStep.banks)
                )
                )
              }
            )
          }
        }
      }
  }

  private suspend fun configureValidationListener() {
    banksComponent?.componentValidationStatus?.collectLatest { validationStatus ->
      when (validationStatus) {
        is PrimerValidationStatus.Validating -> {
          sendEvent(PrimerHeadlessUniversalCheckoutRedirectManagerEvent.ON_VALIDATING.eventName,
            JSONObject().apply {
              put(
                "validating", "true"
              )xe
            }
          )
        }
        is PrimerValidationStatus.Invalid -> {
          sendEvent(PrimerHeadlessUniversalCheckoutRedirectManagerEvent.ON_IN_VALID.eventName,
            JSONObject().apply {
              put(
                "errors",
                JSONArray(
                  validationStatus.validationErrors.map {
                    JSONObject().apply {
                      put(
                        "errorId", it.errorId)
                        put(
                        "description", it.description)
                    put(
                      "diagnosticsId",it.diagnosticsId)

                    }
                  }
                )
              )
            }
          )
        }
        is PrimerValidationStatus.Valid -> {
          when (validationStatus.collectableData) {
              is BanksCollectableData.BankId -> {
                banksComponent?.submit()
                sendEvent(PrimerHeadlessUniversalCheckoutRedirectManagerEvent.ON_VALID.eventName,
                  JSONObject().apply {
                  }
                )
              }
              is BanksCollectableData.Filter -> {
                // no-op
              }
          }
        }
        is PrimerValidationStatus.Error -> {
          sendEvent(PrimerHeadlessUniversalCheckoutRedirectManagerEvent.ON_ERROR.eventName,
            JSONObject().apply {
              put(
                "errors", JSONArray(
                  JSONObject().apply {
                    put(
                      "errorId",    validationStatus.error.errorId)
                    put(
                      "description", validationStatus.error.description)
                    put(
                      "diagnosticsId",validationStatus.error.diagnosticsId)
                  }
                )
              )
            }
          )
        }
      }
    }
  }

  @ReactMethod
  fun addListener(eventName: String?) = Unit

  @ReactMethod
  fun removeListeners(count: Int?) = Unit


  private fun prepareData(data: JSONObject?): WritableMap {
    return data?.let { convertJsonToMap(data) } ?: Arguments.createMap()
  }

  private fun sendEvent(name: String, data: JSONObject?) {
    val params = prepareData(data)
    reactApplicationContext.getJSModule(
      DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
    ).emit(name, params)
  }

  @ReactMethod
  fun cleanUp(promise: Promise) {
    job?.cancel()
    job = null
    banksComponent = null
    promise.resolve(null)
  }
}
