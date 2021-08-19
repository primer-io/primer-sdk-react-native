package com.primerioreactnative.datamodels

import kotlinx.serialization.Serializable


@Serializable
data class PrimerExceptionRN(
  val exceptionType: ExceptionTypeRN,
  val description: String? = null,
)

@Serializable
enum class ExceptionTypeRN {
  ParseJsonFailed,
  InitFailed,
  CheckoutFlowFailed,
  TokenizationFailed,
}
