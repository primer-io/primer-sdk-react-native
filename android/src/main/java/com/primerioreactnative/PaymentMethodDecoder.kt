package com.primerioreactnative

import android.util.Log
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
    Log.i("primer-rn","Processing")
    Log.i("primer-rn", item.toString())

    val type = if (item.has("type")) item.getString("type") else return null

    return when (type) {
      "PAYMENT_CARD" -> PaymentMethod.Card()
//      "GOOGLE_PAY" ->
//      "APPLE_PAY" ->
      "PAYPAL" -> PaymentMethod.PayPal()
      "GOCARDLESS" -> createGoCardlessConfig(item)
      else -> null
    }
  }

  private fun createGoCardlessConfig(data: JSONObject): PaymentMethod.GoCardless? {
    val customerAddress = data.takeIf { it.has("customerAddress") }?.getJSONObject("customerAddress") ?: JSONObject()
    val companyAddress = data.takeIf { it.has("companyAddress") }?.getJSONObject("companyAddress") ?: return null

    return PaymentMethod.GoCardless(
      companyName = data.getString("companyName"),
      companyAddress = formatAddress(companyAddress),
      customerName = JSONPrimitiveDecoder.asStringOpt(data, "customerName"),
      customerEmail = JSONPrimitiveDecoder.asStringOpt(data,"customerEmail"),
      customerAddressLine1 = JSONPrimitiveDecoder.asStringOpt(customerAddress, "line1"),
      customerAddressLine2 = JSONPrimitiveDecoder.asStringOpt(customerAddress, "line2"),
      customerAddressCity = JSONPrimitiveDecoder.asStringOpt(customerAddress, "city"),
      customerAddressState = JSONPrimitiveDecoder.asStringOpt(customerAddress, "state"),
      customerAddressCountryCode = JSONPrimitiveDecoder.asStringOpt(customerAddress, "countryCode"),
      customerAddressPostalCode = JSONPrimitiveDecoder.asStringOpt(customerAddress, "postalCode")
    )
  }

  private fun formatAddress(address: JSONObject): String {
    val line1 = address.getString("line1")
    val city = address.getString("city")
    val postalCode = address.getString("postalCode")
    val countryCode = address.getString("countryCode")

    return "$line1, $city, $postalCode, $countryCode"
  }
}
