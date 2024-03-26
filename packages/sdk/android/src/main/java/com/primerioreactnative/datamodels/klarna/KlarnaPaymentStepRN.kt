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

    @Serializable 
    class PaymentViewLoadedRN : KlarnaPaymentStepRN {
        override val stepName: String = "paymentViewLoaded"
    }

    @Serializable 
    data class PaymentSessionAuthorizedRN(
        override val stepName: String = "paymentSessionAuthorized",
        val isFinalized: Boolean
    ) : KlarnaPaymentStepRN

    @Serializable 
    class PaymentSessionFinalizedRN : KlarnaPaymentStepRN {
        override val stepName: String = "paymentSessionFinalized"
    }
}
