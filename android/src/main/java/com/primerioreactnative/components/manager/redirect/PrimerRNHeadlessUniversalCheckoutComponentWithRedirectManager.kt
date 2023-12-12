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
import com.primerioreactnative.components.manager.raw.PrimerRNHeadlessUniversalCheckoutRawManager
import com.primerioreactnative.datamodels.ErrorTypeRN
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

  // TODO: maybe rename this function to match JS conventions
  @ReactMethod
  fun onBankSelected(bankId: String, promise: Promise) {
    banksComponent?.updateCollectedData(BanksCollectableData.BankId(bankId))
    promise.resolve(null)

  }

  // TODO: maybe rename this function to match JS conventions
  @ReactMethod
  fun onBankFilterChange(filter: String, promise: Promise) {
    banksComponent?.updateCollectedData(BanksCollectableData.Filter(filter))
    // TODO : maybe remove promise if unnecessary
    promise.resolve(null)
  }

  private suspend fun configureErrorListener() {
    banksComponent?.componentError?.collectLatest { error ->
      Log.e("error",error.toString())
    }
//    } catch (e: SdkUninitializedException) {
//      // TODO: use sendEvent here
////      promise.reject(ErrorTypeRN.UnitializedSdkSession.errorId, e.message, e)
//    } catch (e: UnsupportedPaymentMethodManagerException) {
//      // TODO: use sendEvent here
////      promise.reject(ErrorTypeRN.UnsupportedPaymentMethod.errorId, e.message, e)
//    } catch (e: Exception) {
//      // TODO: use sendEvent here
//      val exception =
//        ErrorTypeRN.NativeBridgeFailed errorTo e.message.orEmpty()
////      promise.reject(exception.errorId, exception.description, e)
//    }
  }


  private suspend fun configureBanksListener() {
    Log.e("error","configureBanksListener")

    banksComponent?.componentStep?.collectLatest { banksStep ->
        when (banksStep) {
          is BanksStep.Loading -> {
            Log.e("error","onRetrieving")
            sendEvent("onRetrieving",
              JSONObject().apply {
                put(
                  "retrieving", "true"
                )
              }
            )
          }
          is BanksStep.BanksRetrieved -> {
            Log.e("error","BanksRetrieved")

            sendEvent("onRetrieved",
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
//    } catch (e: SdkUninitializedException) {
//      // TODO: use sendEvent here
////      promise.reject(ErrorTypeRN.UnitializedSdkSession.errorId, e.message, e)
//    } catch (e: UnsupportedPaymentMethodManagerException) {
//      // TODO: use sendEvent here
////      promise.reject(ErrorTypeRN.UnsupportedPaymentMethod.errorId, e.message, e)
//    } catch (e: Exception) {
//      // TODO: use sendEvent here
//      val exception =
//        ErrorTypeRN.NativeBridgeFailed errorTo e.message.orEmpty()
////      promise.reject(exception.errorId, exception.description, e)
//    }
  }

  private suspend fun configureValidationListener() {
    Log.e("error","configureValidationListener")

    banksComponent?.componentValidationStatus?.collectLatest { validationStatus ->
      when (validationStatus) {
        is PrimerValidationStatus.Validating -> {
          // no-op
          sendEvent("onValidating",
            JSONObject().apply {
              put(
                "validating", "true"
              )
            }
          )
        }
        is PrimerValidationStatus.Invalid -> {
          Log.e("error",validationStatus.toString())

          sendEvent("onInvalid",
            JSONObject().apply {
              put(
                "validating", "false"
              );
              put(
                "errors", JSONArray(
                  "InValid"
                )
              )
            }
          )
        }
        is PrimerValidationStatus.Valid -> {
          Log.e("error",validationStatus.toString())

          when (validationStatus.collectableData) {
              is BanksCollectableData.BankId -> {
                banksComponent?.submit()
                Log.e("error","ran bank")
              }
              is BanksCollectableData.Filter -> {
                // no-op
              }
          }
        }
        is PrimerValidationStatus.Error -> {
          Log.e("error",validationStatus.toString())

          sendEvent("onError",
            JSONObject().apply {
              put(
                "errors", JSONArray(
                  "Something is wrong"
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
