package com.primerioreactnative.datamodels.klarna

import kotlinx.serialization.Serializable

@Serializable
internal sealed interface KlarnaPaymentStepRN {
    @Serializable
    data class PaymentSessionCreatedRN(
        val paymentCategories: List<KlarnaPaymentCategoryRN>
    ) : KlarnaPaymentStepRN

    @Serializable data class PaymentSessionAuthorizedRN(
        val isFinalized: Boolean
    ) : KlarnaPaymentStepRN
}
