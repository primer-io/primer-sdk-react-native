package com.primerioreactnative.huc.manager.raw

import com.primerioreactnative.datamodels.PrimerErrorRN
import com.primerioreactnative.huc.events.PrimerHeadlessUniversalCheckoutRawDataManagerEvent
import io.primer.android.components.domain.core.models.card.PrimerHeadlessUniversalCheckoutCardMetadata
import io.primer.android.components.domain.core.models.metadata.PrimerHeadlessUniversalCheckoutPaymentMethodMetadata
import io.primer.android.components.domain.error.PrimerInputValidationError
import io.primer.android.components.manager.raw.PrimerPaymentMethodRawDataManagerListener
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject

internal class PrimerRNHeadlessUniversalCheckoutRawManagerListener :
  PrimerPaymentMethodRawDataManagerListener {

  var sendEvent: ((eventName: String, paramsJson: JSONObject?) -> Unit)? = null

  override fun onValidationChanged(isValid: Boolean, errors: List<PrimerInputValidationError>) {
    sendEvent?.invoke(
      PrimerHeadlessUniversalCheckoutRawDataManagerEvent.ON_VALIDATION_CHANGED.eventName,
      JSONObject().apply {
        put("isValid", isValid)
        put(
          "errors",
          JSONArray(
            errors.map {
              JSONObject(
                Json.encodeToString(
                  PrimerErrorRN(
                    it.errorId,
                    it.description
                  )
                )
              )
            }
          )
        )
      }
    )
  }

  override fun onMetadataChanged(metadata: PrimerHeadlessUniversalCheckoutPaymentMethodMetadata) {
    sendEvent?.invoke(
      PrimerHeadlessUniversalCheckoutRawDataManagerEvent.ON_METADATA_CHANGED.eventName,
      JSONObject().apply {
        if (metadata is PrimerHeadlessUniversalCheckoutCardMetadata) {
          put("cardNetwork", metadata.cardNetwork.name)
        }
      }
    )
  }
}
