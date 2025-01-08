package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerOrderRN
import com.primerioreactnative.datamodels.PrimerShippingRN
import io.primer.android.domain.action.models.PrimerOrder
import io.primer.android.domain.action.models.PrimerShipping

internal fun PrimerOrder.toPrimerOrderRN() =
  PrimerOrderRN(
    countryCode = countryCode,
    shipping = shipping?.toPrimerShippingRN(),
  )

internal fun PrimerShipping.toPrimerShippingRN() = PrimerShippingRN(amount, methodId, methodName, methodDescription)
