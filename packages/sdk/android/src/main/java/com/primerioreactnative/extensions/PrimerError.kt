package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerErrorRN
import io.primer.android.domain.error.models.PrimerError

fun PrimerError.toPrimerErrorRN(): PrimerErrorRN =
    PrimerErrorRN(
        errorId = errorId,
        errorCode = errorCode,
        description = description,
        diagnosticsId = diagnosticsId,
        recoverySuggestion = recoverySuggestion,
    )
