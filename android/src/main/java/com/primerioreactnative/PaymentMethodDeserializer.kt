package com.primerioreactnative

import io.primer.android.PaymentMethod
import org.json.JSONArray
import java.lang.Exception

class PaymentMethodDeserializer(private val serialized: String) {
  private fun paymentMethodsFromInput(input: String): List<PaymentMethod> {
    val json = deserialize(input)
    val paymentMethods = ArrayList<PaymentMethod>()

    if (json != null) {
      for (i in 0 .. json.length()) {

      }
    }

    return paymentMethods
  }

  private fun deserialize(serialized: String): JSONArray? {
    var json: JSONArray? = null

    try {
      json = JSONArray(serialized)
    } catch (e: Exception) {}

    return json
  }
}
