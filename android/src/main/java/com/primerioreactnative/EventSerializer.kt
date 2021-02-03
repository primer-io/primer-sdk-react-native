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
      is CheckoutEvent.TokenAddedToVault -> serializeToken(e.data)
      is CheckoutEvent.TokenizationSuccess -> serializeToken(e.data)
      is CheckoutEvent.TokenRemovedFromVault -> serializeToken(e.data)
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


  private fun serializeToken(data: PaymentMethodToken): JSONObject {
    return JSONObject().apply {
      put("token", data.token)
      put("analyticsId", data.analyticsId)
      put("paymentInstrumentType", data.paymentInstrumentType)
      put("paymentInstrumentData", data.paymentInstrumentData.toString())
      data.vaultData?.let {
        put("vaultData", JSONObject().apply {
          put("customerId", it.customerId)
        })
      }
    }
  }
}
