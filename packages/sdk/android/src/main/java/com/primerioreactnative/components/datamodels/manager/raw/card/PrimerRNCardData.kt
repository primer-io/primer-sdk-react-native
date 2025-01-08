package com.primerioreactnative.components.datamodels.manager.raw.card

import io.primer.android.components.domain.core.models.card.PrimerCardData
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNCardData(
  val cardNumber: String? = null,
  val expiryDate: String? = null,
  val cvv: String? = null,
  val cardholderName: String? = null,
) {
  fun toPrimerCardData() =
    PrimerCardData(
      cardNumber.orEmpty(),
      expiryDate.orEmpty(),
      cvv.orEmpty(),
      cardholderName,
    )
}
