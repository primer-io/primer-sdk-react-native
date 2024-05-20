package com.primerioreactnative.datamodels.extensions.ach

import com.primerioreactnative.datamodels.ach.StripeAchUserDetailsStepRN
import io.primer.android.components.presentation.paymentMethods.nativeUi.stripe.ach.composable.StripeAchUserDetailsStep

internal fun StripeAchUserDetailsStep.TokenizationStarted.toTokenizationStartedRN() =
    StripeAchUserDetailsStepRN.TokenizationStartedRN

internal fun StripeAchUserDetailsStep.CollectUserDetails.toCollectUserDetailsRN() =
    StripeAchUserDetailsStepRN.CollectUserDetailsRN(
        firstName = firstName,
        lastName = lastName,
        emailAddress = emailAddress
    )
