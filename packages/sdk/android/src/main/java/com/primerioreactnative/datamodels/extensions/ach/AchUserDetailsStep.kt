package com.primerioreactnative.datamodels.extensions.ach

import com.primerioreactnative.datamodels.ach.AchUserDetailsStepRN
import io.primer.android.stripe.ach.api.composable.AchUserDetailsStep

internal fun AchUserDetailsStep.UserDetailsCollected.toUserDetailsCollectedRN() = AchUserDetailsStepRN.UserDetailsCollectedRN()

internal fun AchUserDetailsStep.UserDetailsRetrieved.toUserDetailsRetrievedRN() =
  AchUserDetailsStepRN.UserDetailsRetrievedRN(
    firstName = firstName,
    lastName = lastName,
    emailAddress = emailAddress,
  )
