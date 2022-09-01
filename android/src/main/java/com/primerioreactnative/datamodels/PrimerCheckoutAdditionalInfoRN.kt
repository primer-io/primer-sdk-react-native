package com.primerioreactnative.datamodels

import kotlinx.serialization.Serializable

@Serializable
sealed class PrimerCheckoutAdditionalInfoRN

@Serializable
data class MultibancoCheckoutAdditionalInfoRN(
  val expiresAt: String,
  val reference: String,
  val entity: String,
) : PrimerCheckoutAdditionalInfoRN()
