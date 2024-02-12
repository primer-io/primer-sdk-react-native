package com.primerioreactnative.components.manager.klarna

import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.lifecycleScope
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.PrimerRNViewModelStoreOwner
import com.primerioreactnative.extensions.klarna.toPaymentSessionCreatedRN
import com.primerioreactnative.extensions.klarna.toPaymentSessionAuthorizedRN
import com.primerioreactnative.extensions.klarna.toPaymentOptionsRN
import com.primerioreactnative.extensions.klarna.toFinalizePaymentRN
import com.primerioreactnative.extensions.klarna.toKlarnaPaymentCategory
import com.primerioreactnative.components.events.PrimerHeadlessUniversalCheckoutComponentEvent
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.NamedComponentStep
import com.primerioreactnative.datamodels.NamedValidatedData
import com.primerioreactnative.utils.convertJsonToArray
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.errorTo
import io.primer.android.components.presentation.paymentMethods.nativeUi.klarna.composable.KlarnaPaymentComponent
import io.primer.android.components.presentation.paymentMethods.nativeUi.klarna.models.KlarnaPaymentCollectableData
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
import com.primerioreactnative.datamodels.klarna.KlarnaPaymentCategoryRN
import org.json.JSONObject
import com.primerioreactnative.extensions.toPrimerErrorRN
import io.primer.android.components.manager.core.composable.PrimerValidationStatus
import com.primerioreactnative.datamodels.PrimerValidationErrorRN
import com.primerioreactnative.datamodels.klarna.KlarnaPaymentCollectableDataRN
import io.primer.android.components.presentation.paymentMethods.nativeUi.klarna.models.KlarnaPaymentStep
import io.primer.android.components.domain.payments.paymentMethods.nativeUi.klarna.models.KlarnaPaymentCategory
import io.primer.android.components.manager.klarna.PrimerHeadlessUniversalCheckoutKlarnaManager
import io.primer.android.PrimerSessionIntent
import android.util.Log

class PrimerRNHeadlessUniversalCheckoutKlarnaPaymentComponent(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "RNTPrimerHeadlessUniversalCheckoutKlarnaPaymentComponent"

    private var job: Job? = null
    private var viewModelStoreOwner: ViewModelStoreOwner? = null
    private var klarnaPaymentComponent: KlarnaPaymentComponent? = null

    @ReactMethod
    fun configure(promise: Promise) {
        val currentViewModelStoreOwner =
            reactContext.currentActivity as? ViewModelStoreOwner
                ?: run { PrimerRNViewModelStoreOwner() }

        viewModelStoreOwner = currentViewModelStoreOwner
        klarnaPaymentComponent = PrimerHeadlessUniversalCheckoutKlarnaManager(currentViewModelStoreOwner, PrimerSessionIntent.CHECKOUT) // TODO TWS-94: don't hardcode this
            .provideKlarnaPaymentComponent()

        val lifecycleScope =
            (reactContext.currentActivity as? LifecycleOwner)?.lifecycleScope
                ?: CoroutineScope(SupervisorJob() + Dispatchers.Main)

        job =
            lifecycleScope.launch {
                if (klarnaPaymentComponent == null) {
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
      if (klarnaPaymentComponent == null) {
        val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
        promise.reject(exception.errorId, exception.description)
      } else {
        klarnaPaymentComponent?.start()
        promise.resolve(null)
      }
    }
  
    @ReactMethod
    fun submit(promise: Promise) {
      if (klarnaPaymentComponent == null) {
        val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
        promise.reject(exception.errorId, exception.description)
      } else {
        klarnaPaymentComponent?.submit()
        promise.resolve(null)
      }
    }

    private suspend fun configureErrorListener() {
        klarnaPaymentComponent?.componentError?.collectLatest { error ->
            sendEvent(
                PrimerHeadlessUniversalCheckoutComponentEvent.ON_ERROR.eventName,
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

    private suspend fun configureStepListener() {
        klarnaPaymentComponent?.componentStep?.collectLatest { klarnaStep ->
            when (klarnaStep) {
                is KlarnaPaymentStep.PaymentSessionCreated -> {
                    sendEvent(
                        name = PrimerHeadlessUniversalCheckoutComponentEvent.ON_STEP.eventName,
                        data = JSONObject(
                            Json.encodeToString(klarnaStep.toPaymentSessionCreatedRN())
                        )
                    )
                }

                is KlarnaPaymentStep.PaymentViewLoaded -> {
                    PrimerKlarnaPaymentViewManager.updatePrimerKlarnaPaymentView(klarnaStep.paymentView)
                    
                    sendEvent(
                        name = PrimerHeadlessUniversalCheckoutComponentEvent.ON_STEP.eventName,
                        data = JSONObject(
                            Json.encodeToString(NamedComponentStep(name = "paymentViewLoaded"))
                        )
                    )
                }

                is KlarnaPaymentStep.PaymentSessionAuthorized -> {
                    sendEvent(
                        name = PrimerHeadlessUniversalCheckoutComponentEvent.ON_STEP.eventName,
                        data = JSONObject(
                            Json.encodeToString(klarnaStep.toPaymentSessionAuthorizedRN())
                        )
                    )
                }

                is KlarnaPaymentStep.PaymentSessionFinalized -> {
                    sendEvent(
                        name = PrimerHeadlessUniversalCheckoutComponentEvent.ON_STEP.eventName,
                        data = JSONObject(
                            Json.encodeToString(NamedComponentStep(name = "paymentSessionFinalized"))
                        )
                    )
                }
            }
        }
    }

    private suspend fun configureValidationListener() {
        klarnaPaymentComponent?.componentValidationStatus?.collectLatest { validationStatus ->
          when (validationStatus) {
            is PrimerValidationStatus.Validating -> {
              sendEvent(
                PrimerHeadlessUniversalCheckoutComponentEvent.ON_VALIDATING.eventName,
                  JSONObject().apply {
                    putData(validationStatus.collectableData as KlarnaPaymentCollectableData)
                  }
              )
            }
            is PrimerValidationStatus.Invalid -> {
              sendEvent(
                PrimerHeadlessUniversalCheckoutComponentEvent.ON_IN_VALID.eventName,
                  JSONObject().apply {
                    putData(validationStatus.collectableData as KlarnaPaymentCollectableData)
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
                PrimerHeadlessUniversalCheckoutComponentEvent.ON_VALID.eventName,
                  JSONObject().apply {
                    putData(validationStatus.collectableData as KlarnaPaymentCollectableData)
                  }
              )
            }
            is PrimerValidationStatus.Error -> {
              sendEvent(
                PrimerHeadlessUniversalCheckoutComponentEvent.ON_VALIDATION_ERROR.eventName,
                  JSONObject().apply {
                    putData(validationStatus.collectableData as KlarnaPaymentCollectableData)
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

    private fun JSONObject.putData(collectableData: KlarnaPaymentCollectableData) {
        put(
            "data",
            JSONObject(
                Json.encodeToString(
                    when (collectableData) {
                        is KlarnaPaymentCollectableData.PaymentOptions -> collectableData.toPaymentOptionsRN()
                        is KlarnaPaymentCollectableData.FinalizePayment -> collectableData.toFinalizePaymentRN()
                    }
                )
            )
        )
    }

    @ReactMethod fun addListener(eventName: String?) = Unit

    @ReactMethod fun removeListeners(count: Int?) = Unit

    @ReactMethod
    fun onSetPaymentOptions(readableMap: ReadableMap, promise: Promise) {
        val returnIntentUrl = readableMap.getString("returnIntentUrl")
        val paymentCategory = readableMap.getMap("paymentCategory") as ReadableMap
        val json = Json { ignoreUnknownKeys = true }
        Log.i("GAE", "$paymentCategory; $readableMap")
        val KlarnaPaymentCategoryRN = json.decodeFromString<KlarnaPaymentCategoryRN>(Json.encodeToString(paymentCategory.toHashMap() as Map<String, String>))
        
        val activity = getCurrentActivity()
        if (klarnaPaymentComponent == null || activity == null) {
            val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
            promise.reject(exception.errorId, exception.description)
        } else {
            klarnaPaymentComponent?.updateCollectedData(KlarnaPaymentCollectableData.PaymentOptions(
                context = activity,
                returnIntentUrl = requireNotNull(returnIntentUrl),
                paymentCategory = KlarnaPaymentCategoryRN.toKlarnaPaymentCategory()
            ))
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun onFinalizePayment(promise: Promise) {
        if (klarnaPaymentComponent == null) {
            val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
            promise.reject(exception.errorId, exception.description)
        } else {
            klarnaPaymentComponent?.updateCollectedData(KlarnaPaymentCollectableData.FinalizePayment)
            promise.resolve(null)
        }
    }

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
        klarnaPaymentComponent = null
        viewModelStoreOwner?.viewModelStore?.clear()
        promise.resolve(null)
    }

    private companion object {
        const val UNINITIALIZED_ERROR =
            """
            The KlarnaPaymentComponent has not been initialized.
            Make sure you have initialized the `KlarnaPaymentComponent' first.
            """
    }
}