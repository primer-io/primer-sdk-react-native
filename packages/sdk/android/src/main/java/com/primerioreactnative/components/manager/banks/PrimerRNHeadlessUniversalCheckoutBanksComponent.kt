package com.primerioreactnative.components.manager.banks

import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.lifecycleScope
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.PrimerRNViewModelStoreOwner
import com.primerioreactnative.components.events.PrimerHeadlessUniversalCheckoutComponentEvent
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.extensions.banks.toBankIdRN
import com.primerioreactnative.datamodels.extensions.banks.toBanksRetrievedRN
import com.primerioreactnative.datamodels.extensions.banks.toFilterRN
import com.primerioreactnative.datamodels.extensions.banks.toLoadingRN
import com.primerioreactnative.extensions.putErrors
import com.primerioreactnative.extensions.putValidationErrors
import com.primerioreactnative.utils.errorTo
import com.primerioreactnative.utils.toWritableArray
import com.primerioreactnative.utils.toWritableMap
import io.primer.android.components.componentWithRedirect.PrimerHeadlessUniversalCheckoutComponentWithRedirectManager
import io.primer.android.components.manager.banks.composable.BanksCollectableData
import io.primer.android.components.manager.banks.composable.BanksStep
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

@Suppress("TooManyFunctions")
class PrimerRNHeadlessUniversalCheckoutBanksComponent(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNTPrimerHeadlessUniversalCheckoutBanksComponent"

  private var job: Job? = null
  private var banksComponent: BanksComponent? = null
  private var viewModelStoreOwner: ViewModelStoreOwner? = null

  @ReactMethod
  fun configure(
    paymentMethodType: String,
    promise: Promise,
  ) {
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
  fun onBankSelected(
    bankId: String,
    promise: Promise,
  ) {
    if (banksComponent == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      banksComponent?.updateCollectedData(BanksCollectableData.BankId(bankId))
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun onBankFilterChange(
    filter: String,
    promise: Promise,
  ) {
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
        PrimerHeadlessUniversalCheckoutComponentEvent.ON_ERROR.eventName,
        JSONObject().apply { putErrors(error) },
      )
    }
  }

  private suspend fun configureBanksListener() {
    banksComponent?.componentStep?.collectLatest { banksStep ->
      when (banksStep) {
        is BanksStep.Loading -> {
          sendEvent(
            PrimerHeadlessUniversalCheckoutComponentEvent.ON_STEP.eventName,
            JSONObject(json.encodeToString(banksStep.toLoadingRN())),
          )
        }

        is BanksStep.BanksRetrieved -> {
          sendEvent(
            PrimerHeadlessUniversalCheckoutComponentEvent.ON_STEP.eventName,
            JSONObject(
              json.encodeToString(banksStep.toBanksRetrievedRN()),
            ),
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
            PrimerHeadlessUniversalCheckoutComponentEvent.ON_VALIDATING.eventName,
            JSONObject().apply {
              putData(validationStatus.collectableData as BanksCollectableData)
            },
          )
        }

        is PrimerValidationStatus.Invalid -> {
          sendEvent(
            PrimerHeadlessUniversalCheckoutComponentEvent.ON_IN_VALID.eventName,
            JSONObject().apply {
              putData(validationStatus.collectableData as BanksCollectableData)
              putValidationErrors(validationStatus.validationErrors)
            },
          )
        }

        is PrimerValidationStatus.Valid -> {
          sendEvent(
            PrimerHeadlessUniversalCheckoutComponentEvent.ON_VALID.eventName,
            JSONObject().apply {
              putData(validationStatus.collectableData as BanksCollectableData)
            },
          )
        }

        is PrimerValidationStatus.Error -> {
          sendEvent(
            PrimerHeadlessUniversalCheckoutComponentEvent.ON_VALIDATION_ERROR.eventName,
            JSONObject().apply {
              putData(validationStatus.collectableData as BanksCollectableData)
              putErrors(validationStatus.error)
            },
          )
        }
      }
    }
  }

  private fun JSONObject.putData(collectableData: BanksCollectableData) {
    put(
      "data",
      JSONObject(
        json.encodeToString(
          when (collectableData) {
            is BanksCollectableData.BankId -> collectableData.toBankIdRN()
            is BanksCollectableData.Filter -> collectableData.toFilterRN()
          },
        ),
      ),
    )
  }

  @ReactMethod
  fun addListener(eventName: String?) = Unit

  @ReactMethod
  fun removeListeners(count: Int?) = Unit

  private fun sendEvent(
    name: String,
    data: JSONObject?,
  ) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(name, data.toWritableMap())
  }

  private fun sendEvent(
    name: String,
    data: JSONArray?,
  ) {
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

    val json = Json { encodeDefaults = true }
  }
}
