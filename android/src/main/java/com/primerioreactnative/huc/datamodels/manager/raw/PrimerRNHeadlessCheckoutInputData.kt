package com.primerioreactnative.huc.datamodels.manager.raw

import io.primer.android.components.domain.core.models.PrimerHeadlessUniversalCheckoutInputData
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNHeadlessCheckoutCardInputData(
  val cardNumber: String,
  val cvv: String,
  val expiryMonth: String,
  val expiryYear: String,
  val cardholderName: String? = null
) : PrimerHeadlessUniversalCheckoutInputData {
  fun toPrimerCardInputData() =
    PrimerRNHeadlessCheckoutCardInputData(cardNumber, cvv, expiryMonth, expiryYear, cardholderName)
}
