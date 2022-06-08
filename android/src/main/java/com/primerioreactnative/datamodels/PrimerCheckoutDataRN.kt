package com.primerioreactnative.datamodels

import kotlinx.serialization.Serializable

@Serializable
data class PrimerCheckoutDataRN(val paymentRN: PrimerPaymentRN)

@Serializable
data class PrimerPaymentRN(
  val id: String,
  val orderId: String,
)
