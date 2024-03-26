package com.primerioreactnative.extensions

import io.primer.android.domain.error.models.PrimerError
import com.primerioreactnative.datamodels.PrimerErrorRN

fun PrimerError.toPrimerErrorRN(): PrimerErrorRN =
    PrimerErrorRN(
        errorId = errorId,
        errorCode = errorCode,
        description = description,
        diagnosticsId = diagnosticsId,
        recoverySuggestion = recoverySuggestion
    )