package com.primerioreactnative.datamodels.klarna

import com.primerioreactnative.datamodels.klarna.KlarnaPaymentCategoryRN
import com.primerioreactnative.datamodels.NamedComponentValidatableData
import kotlinx.serialization.Serializable

@Serializable
internal sealed interface KlarnaPaymentCollectableDataRN : NamedComponentValidatableData {
    @Serializable
    data class PaymentOptionsRN(
        override val validatableDataName: String = "klarnaPaymentOptions",
        val returnIntentUrl: String,
        val paymentCategory: KlarnaPaymentCategoryRN
    ) : KlarnaPaymentCollectableDataRN

    @Serializable
    class FinalizePaymentRN : KlarnaPaymentCollectableDataRN {
        override val validatableDataName = "klarnaPaymentFinalization"
    }
}