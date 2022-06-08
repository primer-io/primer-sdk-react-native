package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerOrderRN
import io.primer.android.domain.action.models.PrimerOrder

internal fun PrimerOrder.toPrimerOrderRN() = PrimerOrderRN(countryCode)
