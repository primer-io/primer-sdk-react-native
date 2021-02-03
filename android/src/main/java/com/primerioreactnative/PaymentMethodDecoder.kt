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
        companyAddress = formatAddress(item.getJSONObject("companyAddress")),
        customerName = item.getString("customerName"),
        customerEmail = item.getString("customerEmail"),
        customerAddressLine1 = item.getJSONObject("customerAddress").getString("line1"),
        customerAddressLine2 = item.getJSONObject("customerAddress").getString("line2"),
        customerAddressCity = item.getJSONObject("customerAddress").getString("city"),
        customerAddressState = item.getJSONObject("customerAddress").getString("state"),
        customerAddressCountryCode = item.getJSONObject("customerAddress").getString("countryCode"),
        customerAddressPostalCode = item.getJSONObject("customerAddress").getString("postalCode")
      )
      else -> null
    }
  }

  private fun formatAddress(address: JSONObject): String {
    val line1 = address.getString("line1")
    val city = address.getString("city")
    val postalCode = address.getString("postalCode")
    val countryCode = address.getString("countryCode")

    return "$line1, $city, $postalCode, $countryCode"
  }
}
