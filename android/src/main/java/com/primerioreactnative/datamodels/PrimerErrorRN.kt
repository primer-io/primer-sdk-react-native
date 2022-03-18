package com.primerioreactnative.datamodels

import kotlinx.serialization.Serializable


@Serializable
data class PrimerErrorRN(
  val errorType: ErrorTypeRN,
  val description: String? = null,
)

@Serializable
enum class ErrorTypeRN {
  ParseJsonFailed,
  InitFailed,
  CheckoutFlowFailed,
  TokenizationFailed,
  AssetMissing,
  AssetMismatch
}
