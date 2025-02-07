package com.primerioreactnative.components.datamodels.manager.vault

import io.primer.android.components.domain.error.PrimerValidationError
import kotlinx.serialization.Serializable

@Serializable
data class PrimerRNValidationError(
    val errorId: String,
    val description: String,
    val diagnosticsId: String,
)

@Serializable
data class PrimerRNValidationErrors(
    val validationErrors: List<PrimerRNValidationError>,
)

internal fun PrimerValidationError.toPrimerRNValidationError() =
    PrimerRNValidationError(
        errorId,
        description,
        diagnosticsId,
    )
