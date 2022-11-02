package com.primerioreactnative.components.datamodels.manager.raw.cardRedirect

import io.primer.android.components.domain.core.models.bancontact.PrimerRawBancontactCardData
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNRawBancontactCardData(
  val cardNumber: String,
  val expiryMonth: String,
  val expiryYear: String,
  val cardholderName: String
) {
  fun toPrimerRawBancontactCardData() =
    PrimerRawBancontactCardData(
      cardNumber,
      expiryMonth,
      expiryYear,
      cardholderName
    )
}
