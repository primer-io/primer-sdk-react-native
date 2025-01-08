package com.primerioreactnative.datamodels.ach

import com.primerioreactnative.datamodels.NamedComponentStep
import kotlinx.serialization.Serializable

@Serializable
internal sealed interface AchUserDetailsStepRN : NamedComponentStep {
  @Serializable
  class UserDetailsCollectedRN : AchUserDetailsStepRN {
    override val stepName: String = "userDetailsCollected"
  }

  @Serializable
  data class UserDetailsRetrievedRN(
    val firstName: String,
    val lastName: String,
    val emailAddress: String,
  ) : AchUserDetailsStepRN {
    override val stepName: String = "userDetailsRetrieved"
  }
}
