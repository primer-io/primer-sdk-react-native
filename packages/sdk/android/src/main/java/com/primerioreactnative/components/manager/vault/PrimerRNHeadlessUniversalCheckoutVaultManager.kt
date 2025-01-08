package com.primerioreactnative.components.manager.vault

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.primerioreactnative.components.datamodels.manager.vault.PrimerRNValidationErrors
import com.primerioreactnative.components.datamodels.manager.vault.PrimerRNVaultedPaymentMethodAdditionalData
import com.primerioreactnative.components.datamodels.manager.vault.PrimerRNVaultedPaymentMethods
import com.primerioreactnative.components.datamodels.manager.vault.toPrimerRNValidationError
import com.primerioreactnative.components.datamodels.manager.vault.toPrimerRNVaultedPaymentMethod
import com.primerioreactnative.components.datamodels.manager.vault.toPrimerVaultedCardAdditionalData
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.utils.errorTo
import com.primerioreactnative.utils.toWritableMap
import io.primer.android.components.manager.vault.PrimerHeadlessUniversalCheckoutVaultManager
import io.primer.android.components.manager.vault.PrimerHeadlessUniversalCheckoutVaultManagerInterface
import kotlinx.coroutines.CoroutineScope
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
  private val vaultScope = CoroutineScope(SupervisorJob())
  private lateinit var nativeVaultManager: PrimerHeadlessUniversalCheckoutVaultManagerInterface

  override fun getName() = "RNPrimerHeadlessUniversalCheckoutVaultManager"

  @ReactMethod
  fun configure(promise: Promise) {
    try {
      nativeVaultManager = PrimerHeadlessUniversalCheckoutVaultManager.newInstance()
      promise.resolve(null)
    } catch (e: Exception) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo (
          e.message
            ?: "An error occurs while initialising the vault manager."
        )
      promise.reject(exception.errorId, exception.description)
    }
  }

  @ReactMethod
  fun fetchVaultedPaymentMethods(promise: Promise) {
    vaultScope.launch {
      nativeVaultManager.fetchVaultedPaymentMethods().onSuccess { vaultedPaymentMethods ->
        promise.resolve(
          JSONObject(
            Json.encodeToString(
              PrimerRNVaultedPaymentMethods(
                vaultedPaymentMethods.map {
                  it.toPrimerRNVaultedPaymentMethod()
                },
              ),
            ),
          ).toWritableMap(),
        )
      }.onFailure { throwable ->
        val exception =
          ErrorTypeRN.NativeBridgeFailed errorTo (
            throwable.message
              ?: "An error occurs while fetching vaulted payment methods."
          )
        promise.reject(exception.errorId, exception.description)
      }
    }
  }

  @ReactMethod
  fun deleteVaultedPaymentMethod(
    vaultedPaymentMethodId: String,
    promise: Promise,
  ) {
    vaultScope.launch {
      nativeVaultManager.deleteVaultedPaymentMethod(vaultedPaymentMethodId).onSuccess {
        promise.resolve(null)
      }.onFailure { throwable ->
        promise.reject(
          ErrorTypeRN.VaultManagerDeleteFailed.errorId,
          throwable.message,
          throwable,
        )
      }
    }
  }

  @ReactMethod
  fun validate(
    vaultedPaymentMethodId: String,
    additionalDataStr: String,
    promise: Promise,
  ) {
    val additionalData: PrimerRNVaultedPaymentMethodAdditionalData =
      json.decodeFromString(additionalDataStr)

    vaultScope.launch {
      nativeVaultManager.validate(
        vaultedPaymentMethodId,
        additionalData.toPrimerVaultedCardAdditionalData(),
      ).onSuccess { errors ->
        promise.resolve(
          JSONObject(
            Json.encodeToString(
              PrimerRNValidationErrors(
                errors.map {
                  it.toPrimerRNValidationError()
                },
              ),
            ),
          ).toWritableMap(),
        )
      }.onFailure { throwable ->
        promise.reject(
          ErrorTypeRN.InvalidVaultedPaymentMethodId.errorId,
          throwable.message,
          throwable,
        )
      }
    }
  }

  @ReactMethod
  fun startPaymentFlow(
    vaultedPaymentMethodId: String,
    promise: Promise,
  ) {
    vaultScope.launch {
      nativeVaultManager.startPaymentFlow(vaultedPaymentMethodId).onSuccess {
        promise.resolve(null)
      }.onFailure { throwable ->
        promise.reject(
          ErrorTypeRN.InvalidVaultedPaymentMethodId.errorId,
          throwable.message,
          throwable,
        )
      }
    }
  }

  @ReactMethod
  fun startPaymentFlowWithAdditionalData(
    vaultedPaymentMethodId: String,
    additionalDataStr: String,
    promise: Promise,
  ) {
    val additionalData: PrimerRNVaultedPaymentMethodAdditionalData =
      json.decodeFromString(additionalDataStr)

    vaultScope.launch {
      nativeVaultManager.startPaymentFlow(
        vaultedPaymentMethodId,
        additionalData.toPrimerVaultedCardAdditionalData(),
      ).onSuccess {
        promise.resolve(null)
      }.onFailure { throwable ->
        promise.reject(
          ErrorTypeRN.InvalidVaultedPaymentMethodId.errorId,
          throwable.message,
          throwable,
        )
      }
    }
  }
}
