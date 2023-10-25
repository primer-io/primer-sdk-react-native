package com.primerioreactnative.components.datamodels.manager.vault

import io.primer.android.components.domain.payments.vault.model.card.PrimerVaultedCardAdditionalData

data class PrimerRNVaultedPaymentMethodAdditionalData(
  val cvv: String
)

internal fun PrimerRNVaultedPaymentMethodAdditionalData.toPrimerVaultedCardAdditionalData() =
  PrimerVaultedCardAdditionalData(cvv)
