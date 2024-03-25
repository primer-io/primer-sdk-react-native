package com.primerioreactnative.datamodels.klarna

import kotlinx.serialization.Serializable
import com.primerioreactnative.datamodels.NamedComponentStep

@Serializable
internal sealed interface KlarnaPaymentStepRN : NamedComponentStep {
    @Serializable
    data class PaymentSessionCreatedRN(
        override val stepName: String = "paymentSessionCreated",
        val paymentCategories: List<KlarnaPaymentCategoryRN>
    ) : KlarnaPaymentStepRN

    @Serializable data class PaymentSessionAuthorizedRN(
        override val stepName: String = "paymentSessionAuthorized",
        val isFinalized: Boolean
    ) : KlarnaPaymentStepRN
}
