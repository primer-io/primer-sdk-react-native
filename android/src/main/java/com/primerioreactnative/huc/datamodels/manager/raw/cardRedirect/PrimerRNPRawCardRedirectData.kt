package com.primerioreactnative.huc.datamodels.manager.raw.card

import io.primer.android.components.domain.core.models.card.PrimerRawCardData
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNPRawBancontactCardData(
  val cardNumber: String,
  val expirationMonth: String,
  val expirationYear: String,
  val cardHolderName: String
) {
  fun toPrimerRawBancontactCardData() =
    PrimerRawBancontactCardData(
      cardNumber,
      expiryMonth,
      expiryYear,
      cardholderName
    )
}
