package com.primerioreactnative.components.datamodels.manager.raw.cardRedirect

import io.primer.android.bancontact.PrimerBancontactCardData
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNBancontactCardData(
  val cardNumber: String? = null,
  val expiryDate: String? = null,
  val expiryYear: String? = null,
  val cardholderName: String? = null
) {
  fun toPrimerBancontactCardData() =
    PrimerBancontactCardData(
      cardNumber.orEmpty(),
      expiryDate.orEmpty(),
      cardholderName.orEmpty()
    )
}
