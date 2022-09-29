package com.primerioreactnative.huc.datamodels.manager.raw.bancontact

import io.primer.android.components.domain.core.models.bancontact.PrimerRawBancontactCardData
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNRawBancontactCardData(
  val cardNumber: String? = null,
  val expiryMonth: String? = null,
  val expiryYear: String? = null,
  val cardholderName: String? = null
) {
  fun toPrimerBancontactCardData() =
    PrimerRawBancontactCardData(
      cardNumber.orEmpty(),
      expiryMonth.orEmpty(),
      expiryYear.orEmpty(),
      cardholderName.orEmpty()
    )
}
