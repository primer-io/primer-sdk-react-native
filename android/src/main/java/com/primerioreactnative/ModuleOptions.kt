package com.primerioreactnative

import io.primer.android.PaymentMethod
import io.primer.android.UniversalCheckoutTheme
import org.json.JSONObject
import java.util.*

class ModuleOptions(
  var clientToken: String = "",
  var amount: Int? = null,
  var currency: String? = null,
  var paymentMethods: List<PaymentMethod> = Collections.emptyList(),
  var uxMode: Int = 0,
  var theme: UniversalCheckoutTheme? = null,
  var autoDismissDelay: Int = 3000
) {
  fun hydrate(str: String) {
    val json = JSONObject(str)

    clientToken = json.getString("clientToken")
    amount = JSONPrimitiveDecoder.asIntOpt(json, "amount")
    currency = JSONPrimitiveDecoder.asStringOpt(json, "currency")
    paymentMethods = PaymentMethodDecoder.fromJson(json.getJSONArray("paymentMethods"))
    uxMode = JSONPrimitiveDecoder.asIntOpt(json, "uxMode", 0)
    theme = json
      .takeIf { it.has("theme") && !it.isNull("theme") }
      ?.getJSONObject("theme")
      ?.let { ThemeDecoder.fromJson(it) }
    autoDismissDelay = JSONPrimitiveDecoder.asIntOpt(json, "autoDismissDelay", 3000)
  }
}
