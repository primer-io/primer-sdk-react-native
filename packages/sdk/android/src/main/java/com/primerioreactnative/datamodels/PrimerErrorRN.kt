package com.primerioreactnative.datamodels

import kotlinx.serialization.Serializable

@Serializable
data class PrimerErrorRN(
  val errorId: String,
  val errorCode: String? = null,
  val description: String? = null,
  val diagnosticsId: String? = null,
  val recoverySuggestion: String? = null,
)

@Serializable
enum class ErrorTypeRN(val errorId: String) {
  NativeBridgeFailed("native-android"),
  UnitializedSdkSession("uninitialized-sdk-session"),
  UnsupportedPaymentMethod("unsupported-payment-method-type"),
  UnsupportedPaymentIntent("unsupported-session-intent"),
  VaultManagerDeleteFailed("vaulted-manager-delete-failed"),
  InvalidVaultedPaymentMethodId("invalid-vaulted-payment-method-id"),
}

@Serializable
data class PrimerValidationErrorRN(
  val errorId: String? = null,
  val description: String? = null,
  val diagnosticsId: String? = null,
)
