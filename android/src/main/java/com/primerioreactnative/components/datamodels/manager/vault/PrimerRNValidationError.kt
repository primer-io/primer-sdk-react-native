package com.primerioreactnative.components.datamodels.manager.vault

import kotlinx.serialization.Serializable
import io.primer.android.components.domain.error.PrimerValidationError

@Serializable
data class PrimerRNValidationError(
  val errorId: String,
  val description: String,
  val diagnosticsId: String
)

@Serializable
data class PrimerRNValidationErrors(
  val validationErrors: List<PrimerRNValidationError>
)

internal fun PrimerValidationError.toPrimerRNValidationError() =
  PrimerRNValidationError(
    it.errorId,
    it.description,
    it.diagnosticId
  )
