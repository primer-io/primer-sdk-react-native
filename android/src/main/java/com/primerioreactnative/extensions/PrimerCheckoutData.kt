package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerCheckoutDataRN
import io.primer.android.domain.PrimerCheckoutData

internal fun PrimerCheckoutData.toPrimerCheckoutDataRN() =
  PrimerCheckoutDataRN(payment.toPrimerPaymentRN())
