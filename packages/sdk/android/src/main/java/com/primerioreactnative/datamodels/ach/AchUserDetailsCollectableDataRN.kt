package com.primerioreactnative.datamodels.ach

import com.primerioreactnative.datamodels.NamedComponentValidatableData
import kotlinx.serialization.Serializable

@Serializable
internal sealed interface AchUserDetailsCollectableDataRN : NamedComponentValidatableData {
    @Serializable
    data class FirstNameRN(val value: String) : AchUserDetailsCollectableDataRN {
        override val validatableDataName = "firstName"
    }

    @Serializable
    data class LastNameRN(val value: String) : AchUserDetailsCollectableDataRN {
        override val validatableDataName = "lastName"
    }

    @Serializable
    data class EmailAddressRN(val value: String) : AchUserDetailsCollectableDataRN {
        override val validatableDataName = "emailAddress"
    }
}
