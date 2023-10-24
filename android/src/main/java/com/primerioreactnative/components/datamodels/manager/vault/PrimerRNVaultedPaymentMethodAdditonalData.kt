package com.primerioreactnative.components.datamodels.manager.vault

import io.primer.android.components.domain.payments.vault.model.card.PrimerVaultedCardAdditionalData

data class PrimerRNVaultedPaymentMethodAdditonalData() {
  val cvv: String
}

internal fun PrimerRNVaultedPaymentMethodAdditonalData.toPrimerVaultedCardAdditionalData() =
  PrimerVaultedCardAdditionalData(it.cvv)
