package com.primerioreactnative.datamodels

import kotlinx.serialization.Serializable


@Serializable
data class PrimerErrorRN(
  val errorId: String? = null,
  val errorDescription: String? = null,
  val recoverySuggestion: String? = null
)

@Serializable
enum class ErrorTypeRN {
  ParseJsonFailed,
  InitFailed,
  CheckoutFlowFailed,
  TokenizationFailed,
}
