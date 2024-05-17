package com.primerioreactnative.components.manager.ach

import androidx.activity.ComponentActivity
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
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.PrimerRNViewModelStoreOwner
import com.primerioreactnative.components.events.PrimerHeadlessUniversalCheckoutComponentEvent
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.PrimerValidationErrorRN
import com.primerioreactnative.datamodels.extensions.ach.toCollectUserDetailsRN
import com.primerioreactnative.datamodels.extensions.ach.toEmailAddressRN
import com.primerioreactnative.datamodels.extensions.ach.toFirstNameRN
import com.primerioreactnative.datamodels.extensions.ach.toLastNameRN
import com.primerioreactnative.datamodels.extensions.ach.toTokenizationStartedRN
import com.primerioreactnative.extensions.toPrimerErrorRN
import com.primerioreactnative.utils.convertJsonToArray
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.errorTo
import io.primer.android.components.manager.ach.PrimerHeadlessUniversalCheckoutAchManager
import io.primer.android.components.manager.core.composable.PrimerValidationStatus
import io.primer.android.components.presentation.paymentMethods.nativeUi.stripe.ach.StripeAchUserDetailsComponent
import io.primer.android.components.presentation.paymentMethods.nativeUi.stripe.ach.composable.StripeAchUserDetailsCollectableData
import io.primer.android.components.presentation.paymentMethods.nativeUi.stripe.ach.composable.StripeAchUserDetailsStep
import kotlinx.coroutines.Job
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject

class PrimerRNHeadlessUniversalCheckoutStripeAchUserDetailsComponent(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNHeadlessUniversalCheckoutStripeAchUserDetailsComponent"

  private var job: Job? = null
  private var viewModelStoreOwner: ViewModelStoreOwner? = null
  private var component: StripeAchUserDetailsComponent? = null

  @ReactMethod
  fun configure(promise: Promise) {
    val currentViewModelStoreOwner =
        reactContext.currentActivity as? ViewModelStoreOwner
            ?: run { PrimerRNViewModelStoreOwner() }

    val activity = reactContext.currentActivity as? ComponentActivity

    if (activity == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNSUPPORTED_ACTIVITY_ERROR
      promise.reject(exception.errorId, exception.description)
      return
    }

    viewModelStoreOwner = currentViewModelStoreOwner

    runCatching {
      PrimerHeadlessUniversalCheckoutAchManager(
              currentViewModelStoreOwner,
              activity.activityResultRegistry
          )
          .provideStripeAchUserDetailsComponent()
    }
        .onSuccess { component = it }

    val lifecycleScope = (activity as LifecycleOwner).lifecycleScope

    job =
        lifecycleScope.launch {
          if (component == null) {
            val exception = ErrorTypeRN.NativeBridgeFailed errorTo INITIALIZATION_ERROR
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
    if (component == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      component?.start()
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun submit(promise: Promise) {
    if (component == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      component?.submit()
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun onSetFirstName(firstName: String, promise: Promise) {
    if (component == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      component?.updateCollectedData(StripeAchUserDetailsCollectableData.FirstName(firstName))
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun onSetLastName(lastName: String, promise: Promise) {
    if (component == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      component?.updateCollectedData(StripeAchUserDetailsCollectableData.LastName(lastName))
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun onSetEmailAddressName(emailAddress: String, promise: Promise) {
    if (component == null) {
      val exception = ErrorTypeRN.NativeBridgeFailed errorTo UNINITIALIZED_ERROR
      promise.reject(exception.errorId, exception.description)
    } else {
      component?.updateCollectedData(StripeAchUserDetailsCollectableData.EmailAddress(emailAddress))
      promise.resolve(null)
    }
  }

  private suspend fun configureErrorListener() {
    component?.componentError?.collectLatest { error ->
      sendEvent(
          PrimerHeadlessUniversalCheckoutComponentEvent.ON_ERROR.eventName,
          JSONObject().apply {
            put(
                "errors",
                JSONArray().apply { put(JSONObject(json.encodeToString(error.toPrimerErrorRN()))) }
            )
          }
      )
    }
  }

  private suspend fun configureStepListener() {
    component?.componentStep?.collectLatest { step ->
      when (step) {
        is StripeAchUserDetailsStep.CollectUserDetails -> {
          sendEvent(
              PrimerHeadlessUniversalCheckoutComponentEvent.ON_STEP.eventName,
              JSONObject(json.encodeToString(step.toCollectUserDetailsRN()))
          )
        }
        is StripeAchUserDetailsStep.TokenizationStarted -> {
          sendEvent(
              PrimerHeadlessUniversalCheckoutComponentEvent.ON_STEP.eventName,
              JSONObject(json.encodeToString(step.toTokenizationStartedRN()))
          )
        }
      }
    }
  }

  private suspend fun configureValidationListener() {
    component?.componentValidationStatus?.collectLatest { validationStatus ->
      when (validationStatus) {
        is PrimerValidationStatus.Validating -> {
          sendEvent(
              PrimerHeadlessUniversalCheckoutComponentEvent.ON_VALIDATING.eventName,
              JSONObject().apply {
                putData(validationStatus.collectableData as StripeAchUserDetailsCollectableData)
              }
          )
        }
        is PrimerValidationStatus.Invalid -> {
          sendEvent(
              PrimerHeadlessUniversalCheckoutComponentEvent.ON_IN_VALID.eventName,
              JSONObject().apply {
                putData(validationStatus.collectableData as StripeAchUserDetailsCollectableData)
                put(
                    "errors",
                    JSONArray(
                        validationStatus.validationErrors.map {
                          JSONObject(
                              json.encodeToString(
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
                putData(validationStatus.collectableData as StripeAchUserDetailsCollectableData)
              }
          )
        }
        is PrimerValidationStatus.Error -> {
          sendEvent(
              PrimerHeadlessUniversalCheckoutComponentEvent.ON_VALIDATION_ERROR.eventName,
              JSONObject().apply {
                putData(validationStatus.collectableData as StripeAchUserDetailsCollectableData)
                put(
                    "errors",
                    JSONArray().apply {
                      put(JSONObject(json.encodeToString(validationStatus.error.toPrimerErrorRN())))
                    }
                )
              }
          )
        }
      }
    }
  }

  private fun JSONObject.putData(collectableData: StripeAchUserDetailsCollectableData) {
    put(
        "data",
        JSONObject(
            json.encodeToString(
                when (collectableData) {
                  is StripeAchUserDetailsCollectableData.FirstName ->
                      collectableData.toFirstNameRN()
                  is StripeAchUserDetailsCollectableData.LastName -> collectableData.toLastNameRN()
                  is StripeAchUserDetailsCollectableData.EmailAddress ->
                      collectableData.toEmailAddressRN()
                }
            )
        )
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
    component = null
    viewModelStoreOwner?.viewModelStore?.clear()
    promise.resolve(null)
  }

  private companion object {
    const val INITIALIZATION_ERROR = """
      An error occurred during component initialization.
    """

    const val UNINITIALIZED_ERROR =
        """
        The component has not been initialized.
        Make sure you have initialized the `component` first.
      """

    const val UNSUPPORTED_ACTIVITY_ERROR =
        """
        Unsupported activity type.
        Make sure your root activity extends ComponentActivity.
      """

    val json = Json { encodeDefaults = true }
  }
}
