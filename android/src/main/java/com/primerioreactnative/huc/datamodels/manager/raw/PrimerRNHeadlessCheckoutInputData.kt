package com.primerioreactnative.huc.datamodels.manager.raw

import io.primer.android.components.domain.core.models.card.PrimerCardRawData
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNPrimerCardRawData(
  val cardNumber: String? = null,
  val cvv: String? = null,
  val expiryMonth: String? = null,
  val expiryYear: String? = null,
  val cardholderName: String? = null
) {
  fun toPrimerCardData() =
    PrimerCardRawData(
      cardNumber.orEmpty(),
      cvv.orEmpty(),
      expiryMonth.orEmpty(),
      expiryYear.orEmpty(),
      cardholderName
    )
}
