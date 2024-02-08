package com.primerioreactnative.datamodels.klarna

import com.primerioreactnative.datamodels.klarna.KlarnaPaymentCategoryRN
import com.primerioreactnative.datamodels.NamedValidatedData
import kotlinx.serialization.Serializable

internal sealed interface KlarnaPaymentCollectableDataRN {
    @Serializable
    data class PaymentOptionsRN(
        val returnIntentUrl: String,
        val paymentCategory: KlarnaPaymentCategoryRN
    ) : KlarnaPaymentCollectableDataRN

    @@Serializable
    object FinalizePaymentRN : KlarnaPaymentCollectableDataRN, NamedValidatedData("finalizePayment")
}