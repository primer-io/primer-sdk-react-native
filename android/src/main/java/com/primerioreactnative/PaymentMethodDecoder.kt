package com.primerioreactnative

import io.primer.android.PaymentMethod
import org.json.JSONArray
import org.json.JSONObject

object PaymentMethodDecoder {
  fun fromJson(raw: JSONArray): MutableList<PaymentMethod> {
    val list = ArrayList<PaymentMethod>()
    val len = raw.length() - 1

    for (i in 0..len) {
      val item = raw[i]

      if (item is JSONObject) {
        toPaymentMethod(item)?.let { list.add(it) }
      }
    }

    return list
  }

  private fun toPaymentMethod(item: JSONObject): PaymentMethod? {
    val type = if (item.has("type")) item.getString("type") else return null

    return when (type) {
      "PAYMENT_CARD" -> PaymentMethod.Card()
//      "GOOGLE_PAY" ->
//      "APPLE_PAY" ->
      "PAYPAL" -> PaymentMethod.PayPal()
      "GOCARDLESS" -> PaymentMethod.GoCardless(
        companyName = item.getString("companyName"),
        companyAddress = item.getString("companyAddress"),
        customerName = item.getString("customerName"),
        customerEmail = item.getString("customerEmail"),
        customerAddressLine1 = item.getString("customerAddressLine1"),
        customerAddressLine2 = item.getString("customerAddressLine2"),
        customerAddressCity = item.getString("customerAddressCity"),
        customerAddressState = item.getString("customerAddressState"),
        customerAddressCountryCode = item.getString("customerAddressCountryCode"),
        customerAddressPostalCode = item.getString("customerAddressPostalCode")
      )
      else -> null
    }
  }
}
