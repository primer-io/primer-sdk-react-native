package com.primerioreactnative.components.manager.redirect

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.primerioreactnative.components.datamodels.manager.raw.retailOutlets.toRNRetailOutletsList
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.errorTo
import io.primer.android.components.SdkUninitializedException
import io.primer.android.components.domain.exception.UnsupportedPaymentMethodManagerException
import io.primer.android.components.manager.banks.composable.BanksStep
import io.primer.android.components.manager.componentWithRedirect.PrimerHeadlessUniversalCheckoutComponentWithRedirectManager
import io.primer.android.components.manager.componentWithRedirect.component.BanksComponent
import io.primer.android.components.manager.raw.PrimerHeadlessUniversalCheckoutRawDataManager
import io.primer.android.data.payments.configure.retailOutlets.RetailOutletsList
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

class PrimerRNHeadlessUniversalCheckoutComponentWithRedirectManager (
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "PrimerRNHeadlessUniversalCheckoutComponentWithRedirectManager"

  private lateinit var banksComponent: BanksComponent
//  private val listener = PrimerRNHeadlessUniversalCheckoutRawManagerListener()

  init {
//    listener.sendEvent = { eventName, paramsJson -> sendEvent(eventName, paramsJson) }
  }
  @ReactMethod
  fun configure(paymentMethodType: String, promise: Promise) {
    val viewModelStoreOwner = reactContext.currentActivity as? ViewModelStoreOwner ?: run{this
      promise.reject("ViewModelStoreOwner","Expected activity class that implement ViewModelStoreOwner")
      return
    }

    val banksComponent = PrimerHeadlessUniversalCheckoutComponentWithRedirectManager(viewModelStoreOwner).provide<BanksComponent>(paymentMethodType)

  }

  @ReactMethod
  fun getAllBanks(paymentMethodType: String, promise: Promise) {
    try {
//      rawManager.setListener(listener)
      banksComponent.componentStep.collectLatest { banksStep ->
          when (banksStep) {
            is BanksStep.Loading ->{

            }
            is BanksStep.BanksRetrieved -> {
              promise.resolve(
                prepareData(
                  JSONObject().apply {
                    put(
                      "initializationData", JSONObject(
                        Json.encodeToString(banksStep.banks
                        )
                      )
                    )
                  }
                )
              )
            }
            else -> promise.resolve(null)
        } else promise.reject(error.errorId, error.description)
      }
    } catch (e: SdkUninitializedException) {
      promise.reject(ErrorTypeRN.UnitializedSdkSession.errorId, e.message, e)
    } catch (e: UnsupportedPaymentMethodManagerException) {
      promise.reject(ErrorTypeRN.UnsupportedPaymentMethod.errorId, e.message, e)
    } catch (e: Exception) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo e.message.orEmpty()
      promise.reject(exception.errorId, exception.description, e)
    }
  }

  private fun prepareData(data: JSONObject?): WritableMap {
    return data?.let { convertJsonToMap(data) } ?: Arguments.createMap()
  }

  @ReactMethod
  fun start(promise: Promise) {
    if (::banksComponent.isInitialized.not()) {
    } else {
      banksComponent.start()
      promise.resolve(null)
    }
  }
  @ReactMethod
  fun submit(promise: Promise) {
    if (::banksComponent.isInitialized.not()) {
    } else {
      banksComponent.submit()
      promise.resolve(null)
    }
  }
}
