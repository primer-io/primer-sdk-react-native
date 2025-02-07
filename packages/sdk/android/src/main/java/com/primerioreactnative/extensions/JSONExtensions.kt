package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerValidationErrorRN
import io.primer.android.components.domain.error.PrimerValidationError
import io.primer.android.domain.error.models.PrimerError
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject

private val json = Json { encodeDefaults = true }

fun JSONObject.putErrors(error: PrimerError) {
    put(
        "errors",
        JSONArray().apply { put(JSONObject(json.encodeToString(error.toPrimerErrorRN()))) },
    )
}

fun JSONObject.putValidationErrors(errors: List<PrimerValidationError>) {
    put(
        "errors",
        JSONArray(
            errors.map {
                JSONObject(
                    json.encodeToString(
                        PrimerValidationErrorRN(
                            it.errorId,
                            it.description,
                            it.diagnosticsId,
                        ),
                    ),
                )
            },
        ),
    )
}

fun JSONObject.removeType() {
    remove("type")
}
