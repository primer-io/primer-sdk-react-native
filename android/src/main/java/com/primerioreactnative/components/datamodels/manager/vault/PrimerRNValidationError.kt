package com.primerioreactnative.components.datamodels.manager.vault

import kotlinx.serialization.Serializable
import io.primer.android.components.domain.error.*

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

//TODO resolve this madness
internal fun PrimerInputValidationError.toPrimerRNValidationError() =
  PrimerRNValidationError(
    errorId,
    description,
    diagnosticsId
  )
