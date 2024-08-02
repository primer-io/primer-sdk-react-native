package com.primerioreactnative.extensions

import org.json.JSONObject
import org.json.JSONArray
import io.primer.android.domain.error.models.PrimerError
import io.primer.android.components.domain.error.PrimerValidationError
import kotlinx.serialization.json.Json
import com.primerioreactnative.datamodels.PrimerValidationErrorRN
import kotlinx.serialization.encodeToString

private val json = Json { encodeDefaults = true }

fun JSONObject.putErrors(error: PrimerError) {
  put(
    "errors",
      JSONArray().apply { put(JSONObject(json.encodeToString(error.toPrimerErrorRN()))) }
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
                    )
                )
            )
          }
      )
  )
}

fun JSONObject.removeType() {
  remove("type")
}