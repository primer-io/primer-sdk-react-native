package com.primerioreactnative.datamodels

import kotlinx.serialization.Serializable

@Serializable
data class PrimerCheckoutDataRN(
  val payment: PrimerPaymentRN,
  val additionalInfo: PrimerCheckoutAdditionalInfoRN? = null
)

@Serializable
data class PrimerPaymentRN(
  val id: String,
  val orderId: String,
)
