package com.primerioreactnative

import io.primer.android.events.CheckoutEvent
import io.primer.android.model.dto.PaymentMethodToken
import org.json.JSONObject


object EventSerializer {
  fun serialize(e: CheckoutEvent): String {
    val json = JSONObject()
    json.put("type", e.type.name)

    val data = when (e) {
      is CheckoutEvent.Exit -> JSONObject().apply {
        put("reason", e.data.reason.name)
      }
      is CheckoutEvent.TokenAddedToVault -> TokenSerializer.serialize(e.data)
      is CheckoutEvent.TokenizationSuccess -> TokenSerializer.serialize(e.data)
      is CheckoutEvent.TokenRemovedFromVault -> TokenSerializer.serialize(e.data)
      is CheckoutEvent.TokenizationError -> JSONObject().apply {
        put("errorId", e.data.errorId ?: "")
        put("diagnosticsId", e.data.diagnosticsId ?: "")
        put("message", e.data.description)
      }
      else -> JSONObject()
    }

    json.put("data", data)

    return json.toString()
  }
}
