package com.primerioreactnative.datamodels.klarna

import com.primerioreactnative.datamodels.NamedComponentValidatableData
import kotlinx.serialization.Serializable

@Serializable
internal sealed interface KlarnaPaymentCollectableDataRN : NamedComponentValidatableData {
  @Serializable
  data class PaymentOptionsRN(
    val returnIntentUrl: String,
    val paymentCategory: KlarnaPaymentCategoryRN,
  ) : KlarnaPaymentCollectableDataRN {
    override val validatableDataName: String = "klarnaPaymentOptions"
  }

  @Serializable
  class FinalizePaymentRN : KlarnaPaymentCollectableDataRN {
    override val validatableDataName = "klarnaPaymentFinalization"
  }
}
