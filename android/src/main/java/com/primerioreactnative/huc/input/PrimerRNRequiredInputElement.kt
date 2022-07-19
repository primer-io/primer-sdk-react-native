package com.primerioreactnative.huc.input

import io.primer.android.components.domain.inputs.models.PrimerInputElementType

internal enum class PrimerRNRequiredInputElement(
  val primerInputElementType: PrimerInputElementType?,
  val field: String
) {
  CARD_NUMBER(PrimerInputElementType.CARD_NUMBER, "cardNumber"),
  CVV(PrimerInputElementType.CVV, "cvv"),
  EXPIRY_DATE(PrimerInputElementType.EXPIRY_DATE, "expiryDate"),
  CARDHOLDER_NAME(PrimerInputElementType.CARDHOLDER_NAME, "cardholderName"),
  UNNOWN(null, "unknown");

  companion object {
    fun safeValueOf(primerInputElementType: PrimerInputElementType) =
      values().find { it.primerInputElementType == primerInputElementType } ?: UNNOWN
  }
}
