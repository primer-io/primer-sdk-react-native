package com.primerioreactnative.DataModels

import io.primer.android.PaymentMethod
import io.primer.android.payment.card.Card
import io.primer.android.payment.gocardless.GoCardless
import io.primer.android.payment.google.GooglePay
import io.primer.android.payment.klarna.Klarna
import io.primer.android.payment.paypal.PayPal
import kotlinx.serialization.Serializable

@Serializable
data class PrimerFlowRN(
  val intent: PrimerIntentRN = PrimerIntentRN.Checkout,
  val paymentMethod: PrimerPaymentMethodTypeRN = PrimerPaymentMethodTypeRN.Any,
) {

  fun toPaymentMethods(): List<PaymentMethod> {
    return when (paymentMethod) {
      PrimerPaymentMethodTypeRN.Any -> listOf(Klarna(), Card(), PayPal())
      PrimerPaymentMethodTypeRN.Klarna -> listOf(Klarna(), Card(), PayPal())
      PrimerPaymentMethodTypeRN.Card -> listOf(Klarna(), Card(), PayPal())
      PrimerPaymentMethodTypeRN.PayPal -> listOf(Klarna(), Card(), PayPal())
      else -> throw Exception()
    }
  }
}

@Serializable
enum class PrimerIntentRN {
  Checkout,
  Vault,
}

@Serializable
enum class PrimerPaymentMethodTypeRN {
  Any,
  Klarna,
  Card,
  PayPal,
  GooglePay,
  ApplePay,
  GoCardless,
}
