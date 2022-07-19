package com.primerioreactnative

import com.primerioreactnative.huc.events.PrimerHeadlessUniversalCheckoutCardManagerEvent
import io.primer.android.components.manager.PrimerCardManagerListener
import org.json.JSONObject

class PrimerRNCardManagerListener : PrimerCardManagerListener {

  var sendEvent: ((eventName: String, paramsJson: JSONObject?) -> Unit)? = null

  override fun onCardValidationChanged(isCardFormValid: Boolean) {
    sendEvent?.invoke(PrimerHeadlessUniversalCheckoutCardManagerEvent.ON_CARD_FORM_IS_VALID_VALUE_CHANGE.eventName,
      JSONObject().apply { put("isCardFormValid", isCardFormValid) })
  }
}
