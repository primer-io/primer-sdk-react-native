package com.primerioreactnative

import io.primer.android.model.dto.PaymentMethodToken
import org.json.JSONArray
import org.json.JSONObject

object TokenSerializer {
  fun serialize(data: PaymentMethodToken): JSONObject {
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

  fun serialize(data: List<PaymentMethodToken>): JSONArray {
    val result = JSONArray()
    data.forEach {
      result.put(serialize(it))
    }
    return result
  }
}
