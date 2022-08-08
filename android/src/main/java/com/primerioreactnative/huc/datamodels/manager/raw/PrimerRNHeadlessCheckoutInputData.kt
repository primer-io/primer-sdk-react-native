package com.primerioreactnative.huc.datamodels.manager.raw

import io.primer.android.components.domain.core.models.card.CardInputData
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNHeadlessCheckoutCardInputData(
  val cardNumber: String? = null,
  val cvv: String? = null,
  val expiryMonth: String? = null,
  val expiryYear: String? = null,
  val cardholderName: String? = null
) {
  fun toPrimerCardInputData() =
    CardInputData(
      cardNumber.orEmpty(),
      cvv.orEmpty(),
      expiryMonth.orEmpty(),
      expiryYear.orEmpty(),
      cardholderName
    )
}
