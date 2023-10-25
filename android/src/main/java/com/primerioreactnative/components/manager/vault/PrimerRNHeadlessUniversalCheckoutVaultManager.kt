package com.primerioreactnative.components.manager.vault

import com.facebook.react.bridge.*
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.components.datamodels.manager.vault.*
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.errorTo
import io.primer.android.components.manager.vault.PrimerHeadlessUniversalCheckoutVaultManager
import io.primer.android.components.manager.vault.PrimerHeadlessUniversalCheckoutVaultManagerInterface
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

class PrimerRNHeadlessUniversalCheckoutVaultManager(
  reactContext: ReactApplicationContext,
  private val json: Json,
) : ReactContextBaseJavaModule(reactContext) {

  private val vaultScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var nativeVaultManager: PrimerHeadlessUniversalCheckoutVaultManagerInterface =
    PrimerHeadlessUniversalCheckoutVaultManager.newInstance()

  override fun getName() = "RNPrimerHeadlessUniversalCheckoutVaultManager"

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
        promise.reject(
          ErrorTypeRN.VaultManagerDeleteFailed.errorId,
          throwable.message,
          throwable
        )
      }
    }
  }

  @ReactMethod
  fun validate(
    vaultedPaymentMethodId: String,
    additionalDataStr: String,
    promise: Promise
  ) {
    val additionalData: PrimerRNVaultedPaymentMethodAdditionalData =
      json.decodeFromString(additionalDataStr)

    vaultScope.launch {
      nativeVaultManager.validate(
        vaultedPaymentMethodId,
        additionalData.toPrimerVaultedCardAdditionalData()
      ).onSuccess { errors ->
        promise.resolve(
          convertJsonToMap(
            JSONObject(
              Json.encodeToString(
                PrimerRNValidationErrors(errors.map {
                  PrimerRNValidationError(it.a, it.b, it.c)
                })
              )
            )
          )
        )
      }.onFailure { throwable ->
        promise.reject(
          ErrorTypeRN.InvalidVaultedPaymentMethodId.errorId,
          throwable.message,
          throwable
        )
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
        promise.reject(
          ErrorTypeRN.InvalidVaultedPaymentMethodId.errorId,
          throwable.message,
          throwable
        )
      }
    }
  }

  @ReactMethod
  fun startPaymentFlow(
    vaultedPaymentMethodId: String,
    additionalDataStr: String,
    promise: Promise
  ) {
    val additionalData: PrimerRNVaultedPaymentMethodAdditionalData =
      json.decodeFromString(additionalDataStr)

    vaultScope.launch {
      nativeVaultManager.startPaymentFlow(
        vaultedPaymentMethodId,
        additionalData.toPrimerVaultedCardAdditionalData()
      ).onSuccess {
        promise.resolve(null)
      }.onFailure { throwable ->
        promise.reject(
          ErrorTypeRN.InvalidVaultedPaymentMethodId.errorId,
          throwable.message,
          throwable
        )
      }
    }
  }
}
