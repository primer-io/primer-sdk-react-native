package com.primerioreactnative.datamodels

import io.primer.android.PaymentMethod
import io.primer.android.payment.card.Card
import io.primer.android.payment.gocardless.GoCardless
import io.primer.android.payment.google.GooglePay
import io.primer.android.payment.klarna.Klarna
import io.primer.android.payment.paypal.PayPal
import kotlinx.serialization.Serializable

@Serializable
data class PrimerIntentRN(
  val vault: Boolean = false,
  val paymentMethod: PrimerPaymentMethodTypeRN = PrimerPaymentMethodTypeRN.Any,
) {

  fun toPaymentMethods(settings: PrimerSettingsRN): List<PaymentMethod> {
    return when (paymentMethod) {
      PrimerPaymentMethodTypeRN.Any -> {
        val countryCode = settings.order?.countryCode ?: throw Exception()
        val currency = settings.order.currency ?: throw Exception()
        val amount = settings.order.amount ?: throw Exception()

        val googlePay = GooglePay(
          countryCode = countryCode,
          currencyCode = currency,
          totalPrice = amount.toString(),
        )

        listOf(Klarna(), Card(), PayPal(), googlePay)
      }
      PrimerPaymentMethodTypeRN.Klarna -> listOf(Klarna())
      PrimerPaymentMethodTypeRN.Card -> listOf(Card())
      PrimerPaymentMethodTypeRN.PayPal -> listOf(PayPal())
      PrimerPaymentMethodTypeRN.GooglePay -> {
        val countryCode = settings.order?.countryCode ?: throw Exception()
        val currency = settings.order.currency ?: throw Exception()
        val amount = settings.order.amount ?: throw Exception()

        val googlePay = GooglePay(
          countryCode = countryCode,
          currencyCode = currency,
          totalPrice = amount.toString(),
        )
        listOf(googlePay)
      }
      PrimerPaymentMethodTypeRN.GoCardless -> {
        val companyName = settings.business?.name ?: throw Exception()
        val companyAddress = addressToString(settings.business.address) ?: throw Exception()
        val goCardless = GoCardless(
          companyName = companyName,
          companyAddress = companyAddress
        )
        return listOf(goCardless)
      }
      else -> throw Exception()
    }
  }

  companion object {
    fun addressToString(a: PrimerAddressRN?): String? {
      if (a == null) return null
      val values = listOf<String?>(a.line1, a.line2, a.postalCode, a.city, a.country)
      return values.reduce { acc, s ->
        s?.let { "$acc$s, " }
      }?.dropLast(2)
    }
  }
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
