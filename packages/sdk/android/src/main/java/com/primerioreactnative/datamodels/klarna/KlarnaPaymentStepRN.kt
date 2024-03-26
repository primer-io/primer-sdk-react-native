package com.primerioreactnative.datamodels.klarna

import kotlinx.serialization.Serializable
import com.primerioreactnative.datamodels.NamedComponentStep

@Serializable
internal sealed interface KlarnaPaymentStepRN : NamedComponentStep {
    @Serializable
    data class PaymentSessionCreatedRN(
        val paymentCategories: List<KlarnaPaymentCategoryRN>
    ) : KlarnaPaymentStepRN {
        override val stepName: String = "paymentSessionCreated"
    }

    @Serializable 
    class PaymentViewLoadedRN : KlarnaPaymentStepRN {
        override val stepName: String = "paymentViewLoaded"
    }

    @Serializable 
    data class PaymentSessionAuthorizedRN(
        val isFinalized: Boolean
    ) : KlarnaPaymentStepRN {
        override val stepName: String = "paymentSessionAuthorized"
    }

    @Serializable 
    class PaymentSessionFinalizedRN : KlarnaPaymentStepRN {
        override val stepName: String = "paymentSessionFinalized"
    }
}
