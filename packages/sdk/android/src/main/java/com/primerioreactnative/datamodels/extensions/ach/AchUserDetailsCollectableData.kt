package com.primerioreactnative.datamodels.extensions.ach

import com.primerioreactnative.datamodels.ach.AchUserDetailsCollectableDataRN
import io.primer.android.stripe.ach.api.composable.AchUserDetailsCollectableData

internal fun AchUserDetailsCollectableData.FirstName.toFirstNameRN() =
  AchUserDetailsCollectableDataRN.FirstNameRN(
    value,
  )

internal fun AchUserDetailsCollectableData.LastName.toLastNameRN() = AchUserDetailsCollectableDataRN.LastNameRN(value)

internal fun AchUserDetailsCollectableData.EmailAddress.toEmailAddressRN() =
  AchUserDetailsCollectableDataRN.EmailAddressRN(
    value,
  )
