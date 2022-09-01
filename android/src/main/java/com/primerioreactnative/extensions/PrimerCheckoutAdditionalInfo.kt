package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.MultibancoCheckoutAdditionalInfoRN
import io.primer.android.domain.payments.additionalInfo.MultibancoCheckoutAdditionalInfo
import io.primer.android.domain.payments.additionalInfo.PrimerCheckoutAdditionalInfo

internal fun PrimerCheckoutAdditionalInfo.toCheckoutAdditionalInfoRN() = when (this) {
  is MultibancoCheckoutAdditionalInfo ->
    MultibancoCheckoutAdditionalInfoRN(expiresAt, reference, entity)
  else -> null
}

