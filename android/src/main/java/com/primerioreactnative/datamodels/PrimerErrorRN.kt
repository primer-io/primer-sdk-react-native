package com.primerioreactnative.datamodels

import kotlinx.serialization.Serializable

@Serializable
data class PrimerErrorRN(
  val errorId: String? = null,
  val description: String? = null,
  val recoverySuggestion: String? = null
)

@Serializable
enum class ErrorTypeRN(val errorId: String) {
  NativeBridgeFailed("native-bridge"),
  AssetMissing("missing-asset"),
  AssetMismatch("mismatch-asset")
}
