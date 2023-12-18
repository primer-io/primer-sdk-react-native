package com.primerioreactnative.datamodels

import kotlinx.serialization.Serializable

@Serializable
data class PrimerInputValidationErrorRN(
  val errorId: String? = null,
  val description: String? = null,
  val inputElementType: String? = null,
  val diagnosticsId: String? = null
)
