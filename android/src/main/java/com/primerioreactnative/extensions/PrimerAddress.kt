package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerAddressRN
import io.primer.android.domain.action.models.PrimerAddress

internal fun PrimerAddress.toPrimerAddressRN() = PrimerAddressRN(
  firstName,
  lastName,
  addressLine1,
  addressLine2,
  postalCode,
  city,
  state,
  countryCode
)
