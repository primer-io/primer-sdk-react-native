package com.primerioreactnative.datamodels.ach

import kotlinx.serialization.Serializable
import com.primerioreactnative.datamodels.NamedComponentStep
import com.primerioreactnative.datamodels.PrimerIssuingBankRN

@Serializable
internal sealed interface StripeAchUserDetailsStepRN : NamedComponentStep {
    @Serializable
    object TokenizationStartedRN : StripeAchUserDetailsStepRN {
        override val stepName: String = "tokenizationStarted"
    }

    @Serializable
    data class CollectUserDetailsRN(
        val firstName: String,
        val lastName: String,
        val emailAddress: String
    ) : StripeAchUserDetailsStepRN {
        override val stepName: String = "collectUserDetails"
    }
}