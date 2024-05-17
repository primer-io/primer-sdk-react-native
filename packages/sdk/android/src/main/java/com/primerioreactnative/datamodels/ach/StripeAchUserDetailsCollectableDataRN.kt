package com.primerioreactnative.datamodels.ach

import com.primerioreactnative.datamodels.NamedComponentValidatableData
import kotlinx.serialization.Serializable

@Serializable
internal sealed interface StripeAchUserDetailsCollectableDataRN : NamedComponentValidatableData {
    @Serializable
    data class FirstNameRN(val value: String) : StripeAchUserDetailsCollectableDataRN {
        override val validatableDataName = "firstName"
    }

    @Serializable
    data class LastNameRN(val value: String) : StripeAchUserDetailsCollectableDataRN {
        override val validatableDataName = "lastName"
    }

    @Serializable
    data class EmailAddressRN(val value: String) : StripeAchUserDetailsCollectableDataRN {
        override val validatableDataName = "emailAddress"
    }
}
