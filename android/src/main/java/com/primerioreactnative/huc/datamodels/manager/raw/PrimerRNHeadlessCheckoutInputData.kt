package com.primerioreactnative.huc.datamodels.manager.raw

import io.primer.android.components.domain.core.models.card.PrimerRawCardData
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNPrimerRawCardData(
  val cardNumber: String? = null,
  val cvv: String? = null,
  val expiryMonth: String? = null,
  val expiryYear: String? = null,
  val cardholderName: String? = null
) {
  fun toPrimerCardData() =
    PrimerRawCardData(
      cardNumber.orEmpty(),
      cvv.orEmpty(),
      expiryMonth.orEmpty(),
      expiryYear.orEmpty(),
      cardholderName
    )
}
