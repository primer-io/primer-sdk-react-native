package com.primerioreactnative.components.manager.klarna

import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.lifecycleScope
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.PrimerRNViewModelStoreOwner
import com.primerioreactnative.components.events.PrimerHeadlessUniversalCheckoutComponentEvent
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.PrimerErrorRN
import com.primerioreactnative.datamodels.klarna.KlarnaPaymentCategoryRN
import com.primerioreactnative.extensions.klarna.toFinalizePaymentRN
import com.primerioreactnative.extensions.klarna.toKlarnaPaymentCategory
import com.primerioreactnative.extensions.klarna.toPaymentOptionsRN
import com.primerioreactnative.extensions.klarna.toPaymentSessionAuthorizedRN
import com.primerioreactnative.extensions.klarna.toPaymentSessionCreatedRN
import com.primerioreactnative.extensions.klarna.toPaymentSessionFinalizedRN
import com.primerioreactnative.extensions.klarna.toPaymentViewLoadedRN
import com.primerioreactnative.extensions.putErrors
import com.primerioreactnative.extensions.putValidationErrors
import com.primerioreactnative.utils.errorTo
import com.primerioreactnative.utils.toWritableArray
import com.primerioreactnative.utils.toWritableMap
import io.primer.android.PrimerSessionIntent
import io.primer.android.components.manager.core.composable.PrimerValidationStatus
import io.primer.android.klarna.PrimerHeadlessUniversalCheckoutKlarnaManager
import io.primer.android.klarna.api.component.KlarnaComponent
import io.primer.android.klarna.api.composable.KlarnaPaymentCollectableData
import io.primer.android.klarna.api.composable.KlarnaPaymentStep
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
class PrimerRNHeadlessUniversalCheckoutKlarnaComponent(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "RNTPrimerHeadlessUniversalCheckoutKlarnaComponent"

  private var job: Job? = null
  private var viewModelStoreOwner: ViewModelStoreOwner? = null
  private var klarnaComponent: KlarnaComponent? = null

  @ReactMethod
  fun configure(
    intent: String,
    promise: Promise,
  ) {
    val primerSessionIntent = PrimerSessionIntent.values().firstOrNull { intent.equals(it.name, true) }
    if (primerSessionIntent == null) {
      val exception =
        PrimerErrorRN(
          errorId = ErrorTypeRN.NativeBridgeFailed.errorId,
          description = "Invalid value for 'intent'.",
          diagnosticsId = null,
          recoverySuggestion = "'intent' can be 'CHECKOUT' or 'VAULT'.",
        )
      promise.reject(exception.errorId, exception.description)
      return
    }

    val currentViewModelStoreOwner =
      reactContext.currentActivity as? ViewModelStoreOwner
        ?: run { PrimerRNViewModelStoreOwner() }

    viewModelStoreOwner = currentViewModelStoreOwner
    klarnaComponent =
      PrimerHeadlessUniversalCheckoutKlarnaManager(currentViewModelStoreOwner)
        .provideKlarnaComponent(primerSessionIntent)

    val lifecycleScope =
      (reactContext.currentActivity as? LifecycleOwner)?.lifecycleScope
        ?: CoroutineScope(SupervisorJob() + Dispatchers.Main)

    job =
      lifecycleScope.launch {
        if (klarnaComponent == null) {
          val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
          promise.reject(exception.errorId, exception.description)
        } else {
          coroutineScope {
            launch { configureStepListener() }

            launch { configureValidationListener() }

            launch { configureErrorListener() }
            promise.resolve(null)
          }
        }
      }
  }

  @ReactMethod
  fun start(promise: Promise) {
    if (klarnaComponent == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      klarnaComponent?.start()
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun submit(promise: Promise) {
    if (klarnaComponent == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      klarnaComponent?.submit()
      promise.resolve(null)
    }
  }

  private suspend fun configureErrorListener() {
    klarnaComponent?.componentError?.collectLatest { error ->
      sendEvent(
        PrimerHeadlessUniversalCheckoutComponentEvent.ON_ERROR.eventName,
        JSONObject().apply { putErrors(error) },
      )
    }
  }

  private suspend fun configureStepListener() {
    klarnaComponent?.componentStep?.collectLatest { klarnaStep ->
      when (klarnaStep) {
        is KlarnaPaymentStep.PaymentSessionCreated -> {
          sendEvent(
            name = PrimerHeadlessUniversalCheckoutComponentEvent.ON_STEP.eventName,
            data =
            JSONObject(
              json.encodeToString(klarnaStep.toPaymentSessionCreatedRN()),
            ),
          )
        }

        is KlarnaPaymentStep.PaymentViewLoaded -> {
          PrimerKlarnaPaymentViewManager.updatePrimerKlarnaPaymentView(klarnaStep.paymentView)

          sendEvent(
            name = PrimerHeadlessUniversalCheckoutComponentEvent.ON_STEP.eventName,
            data = JSONObject(json.encodeToString(klarnaStep.toPaymentViewLoadedRN())),
          )
        }

        is KlarnaPaymentStep.PaymentSessionAuthorized -> {
          sendEvent(
            name = PrimerHeadlessUniversalCheckoutComponentEvent.ON_STEP.eventName,
            data = JSONObject(json.encodeToString(klarnaStep.toPaymentSessionAuthorizedRN())),
          )
        }

        is KlarnaPaymentStep.PaymentSessionFinalized -> {
          sendEvent(
            name = PrimerHeadlessUniversalCheckoutComponentEvent.ON_STEP.eventName,
            data =
            JSONObject(
              json.encodeToString(klarnaStep.toPaymentSessionFinalizedRN()),
            ),
          )
        }
      }
    }
  }

  private suspend fun configureValidationListener() {
    klarnaComponent?.componentValidationStatus?.collectLatest { validationStatus ->
      when (validationStatus) {
        is PrimerValidationStatus.Validating -> {
          sendEvent(
            PrimerHeadlessUniversalCheckoutComponentEvent.ON_VALIDATING.eventName,
            JSONObject().apply {
              putData(validationStatus.collectableData as KlarnaPaymentCollectableData)
            },
          )
        }

        is PrimerValidationStatus.Invalid -> {
          sendEvent(
            PrimerHeadlessUniversalCheckoutComponentEvent.ON_IN_VALID.eventName,
            JSONObject().apply {
              putData(validationStatus.collectableData as KlarnaPaymentCollectableData)
              putValidationErrors(validationStatus.validationErrors)
            },
          )
        }

        is PrimerValidationStatus.Valid -> {
          sendEvent(
            PrimerHeadlessUniversalCheckoutComponentEvent.ON_VALID.eventName,
            JSONObject().apply {
              putData(validationStatus.collectableData as KlarnaPaymentCollectableData)
            },
          )
        }

        is PrimerValidationStatus.Error -> {
          sendEvent(
            PrimerHeadlessUniversalCheckoutComponentEvent.ON_VALIDATION_ERROR.eventName,
            JSONObject().apply {
              putData(validationStatus.collectableData as KlarnaPaymentCollectableData)
              putErrors(validationStatus.error)
            },
          )
        }
      }
    }
  }

  private fun JSONObject.putData(collectableData: KlarnaPaymentCollectableData) {
    put(
      "data",
      JSONObject(
        json.encodeToString(
          when (collectableData) {
            is KlarnaPaymentCollectableData.PaymentOptions ->
              collectableData.toPaymentOptionsRN()

            is KlarnaPaymentCollectableData.FinalizePayment ->
              collectableData.toFinalizePaymentRN()
          },
        ),
      ),
    )
  }

  @ReactMethod
  fun addListener(eventName: String?) = Unit

  @ReactMethod
  fun removeListeners(count: Int?) = Unit

  @ReactMethod
  fun onSetPaymentOptions(
    readableMap: ReadableMap,
    promise: Promise,
  ) {
    val returnIntentUrl = readableMap.getString("returnIntentUrl")
    val paymentCategory = readableMap.getMap("paymentCategory") as ReadableMap
    val json = Json { ignoreUnknownKeys = true }
    val klarnaPaymentCategoryRN =
      json.decodeFromString<KlarnaPaymentCategoryRN>(
        Json.encodeToString(paymentCategory.toHashMap() as Map<String, String>),
      )

    val activity = currentActivity

    if (activity == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo MISSING_ACTIVITY_ERROR
      promise.reject(exception.errorId, exception.description)
    } else if (klarnaComponent == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      klarnaComponent?.updateCollectedData(
        KlarnaPaymentCollectableData.PaymentOptions(
          context = activity,
          returnIntentUrl = requireNotNull(returnIntentUrl),
          paymentCategory = klarnaPaymentCategoryRN.toKlarnaPaymentCategory(),
        ),
      )
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun onFinalizePayment(promise: Promise) {
    if (klarnaComponent == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      klarnaComponent?.updateCollectedData(KlarnaPaymentCollectableData.FinalizePayment)
      promise.resolve(null)
    }
  }

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
    klarnaComponent = null
    viewModelStoreOwner?.viewModelStore?.clear()
    promise.resolve(null)
  }

  private companion object {
    const val UNINITIALIZED_ERROR =
      """
            The KlarnaComponent has not been initialized.
            Make sure you have initialized the `KlarnaComponent` first.
            """
    const val MISSING_ACTIVITY_ERROR =
      """
            Could not retrieve running activity from context.
            """

    val json by lazy { Json { encodeDefaults = true } }
  }
}
