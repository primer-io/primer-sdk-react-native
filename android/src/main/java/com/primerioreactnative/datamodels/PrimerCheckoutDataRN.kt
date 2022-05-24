package com.primerioreactnative.datamodels

import io.primer.android.domain.PrimerCheckoutData
import io.primer.android.domain.payments.create.model.Payment
import kotlinx.serialization.Serializable

@Serializable
data class PrimerCheckoutDataRN(val paymentRN: PrimerPaymentRN)

fun PrimerCheckoutData.toPrimerCheckoutDataRN() = PrimerCheckoutDataRN(payment.toPrimerPaymentRN())

@Serializable
data class PrimerPaymentRN(
  val id: String,
  val orderId: String,
)

fun Payment.toPrimerPaymentRN() = PrimerPaymentRN(id, orderId)
