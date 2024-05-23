package com.primerioreactnative.datamodels.ach

import kotlinx.serialization.Serializable
import com.primerioreactnative.datamodels.NamedComponentStep
import com.primerioreactnative.datamodels.PrimerIssuingBankRN

@Serializable
internal sealed interface AchUserDetailsStepRN : NamedComponentStep {
    @Serializable
    object UserDetailsCollectedRN : AchUserDetailsStepRN {
        override val stepName: String = "userDetailsCollected"
    }

    @Serializable
    data class UserDetailsRetrievedRN(
        val firstName: String,
        val lastName: String,
        val emailAddress: String
    ) : AchUserDetailsStepRN {
        override val stepName: String = "userDetailsRetrieved"
    }
}