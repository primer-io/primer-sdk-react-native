package com.primerioreactnative.components.manager.vault

import com.facebook.react.bridge.*
import io.primer.android.components.manager.vault.PrimerHeadlessUniversalCheckoutVaultManager
import io.primer.android.components.manager.vault.PrimerHeadlessUniversalCheckoutVaultManagerInterface
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

class PrimerRNHeadlessUniversalCheckoutVaultManager(
  private val reactContext: ReactApplicationContext,
  private val json: Json,
) : ReactContextBaseJavaModule(reactContext) {

  private val vaultScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private lateinit var nativeVaultManager: PrimerHeadlessUniversalCheckoutVaultManagerInterface

  init {
    //TODO find way to handle exceptions that might be thrown by this
    nativeVaultManager = PrimerHeadlessUniversalCheckoutVaultManager.newInstance()
  }

  override fun getName(promise: Promise): String {
    return "PrimerHeadlessUniversalCheckout"
  }

  @ReactMethod
  fun fetchVaultedPaymentMethods(promise: Promise) {
    vaultScope.launch {
      nativeVaultManager.fetchVaultedPaymentMethods().onSuccess { vaultedPaymentMethods ->
        promise.resolve(
          convertJsonToMap(
            JSONObject(
              Json.encodeToString(
                PrimerRNVaultedPaymentMethods(vaultedPaymentMethods.map {
                  it.toPrimerRNVaultedPaymentMethod()
                })
              )
            )
          )
        )
      }.onFailure { throwable ->
        val exception =
          ErrorTypeRN.NativeBridgeFailed errorTo "An error occurs while fetching vaulted payment methods."
        promise.reject(exception.errorId, exception.description)
      }
    }
  }

  @ReactMethod
  fun deleteVaultedPaymentMethod(vaultedPaymentMethodId: String, promise: Promise) {
    vaultScope.launch {
      nativeVaultManager.deleteVaultedPaymentMethod(vaultedPaymentMethodId).onSuccess {
        promise.resolve(null)
      }.onFailure { throwable ->
        promise.reject(throwable)
      }
    }
  }

  @ReactMethod
  fun validate(
    vaultedPaymentMethodId: String,
    additionalDataStr: String
  ) {
    //TODO map the aditional data string to object using JSON

    vaultScope.launch {
      nativeVaultManager.validate(vaultedPaymentMethodId, additionalData).onSuccess { errors ->
        promise.resolve(errors)
      }.onFailure { throwable ->
        promise.reject(throwable)
      }
    }
  }

  @ReactMethod
  fun startPaymentFlow(
    vaultedPaymentMethodId: String,
    promise: Promise
  ) {
    vaultScope.launch {
      nativeVaultManager.startPaymentFlow(vaultedPaymentMethodId).onSuccess {
        promise.resolve(null)
      }.onFailure { throwable ->
        promise.reject(throwable)
      }
    }
  }

  @ReactMethod
  fun startPaymentFlow(
    vaultedPaymentMethodId: String,
    additionalDataStr: String,
    promise: Promise
  ) {
    //TODO map the aditional data string to object using JSON

    vaultScope.launch {
      nativeVaultManager.startPaymentFlow(vaultedPaymentMethodId, additionalData).onSuccess {
        promise.resolve(null)
      }.onFailure { throwable ->
        promise.reject(throwable)
      }
    }
  }
}
