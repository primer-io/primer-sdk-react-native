package com.primerioreactnative.huc.manager.raw

import com.primerioreactnative.huc.events.PrimerHeadlessUniversalCheckoutRawDataManagerEvent
import io.primer.android.components.domain.core.models.metadata.PrimerHeadlessUniversalCheckoutPaymentMethodMetadata
import io.primer.android.components.domain.error.PrimerInputValidationError
import io.primer.android.components.manager.raw.PrimerPaymentMethodRawDataManagerListener
import org.json.JSONArray
import org.json.JSONObject

internal class PrimerRNHeadlessUniversalCheckoutRawManagerListener :
  PrimerPaymentMethodRawDataManagerListener {

  var sendEvent: ((eventName: String, paramsJson: JSONObject?) -> Unit)? = null

  override fun onValidationChanged(isValid: Boolean, errors: List<PrimerInputValidationError>) {
    sendEvent?.invoke(
      PrimerHeadlessUniversalCheckoutRawDataManagerEvent.ON_VALIDATION_CHANGED.name,
      JSONObject().apply {
        put("isValid", isValid)
        put("errors", JSONArray(errors.map { }))
      }
    )
  }

  override fun onMetadataChanged(metadata: PrimerHeadlessUniversalCheckoutPaymentMethodMetadata) {
    sendEvent?.invoke(
      PrimerHeadlessUniversalCheckoutRawDataManagerEvent.ON_VALIDATION_CHANGED.name,
      JSONObject().apply {
      }
    )
  }
}
