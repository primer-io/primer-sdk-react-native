package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.MultibancoCheckoutAdditionalInfoRN
import com.primerioreactnative.datamodels.PromptPayCheckoutAdditionalInfoRN
import io.primer.android.domain.payments.additionalInfo.MultibancoCheckoutAdditionalInfo
import io.primer.android.domain.payments.additionalInfo.PrimerCheckoutAdditionalInfo
import io.primer.android.domain.payments.additionalInfo.PromptPayCheckoutAdditionalInfo

internal fun PrimerCheckoutAdditionalInfo.toCheckoutAdditionalInfoRN() = when (this) {
  is MultibancoCheckoutAdditionalInfo ->
    MultibancoCheckoutAdditionalInfoRN(expiresAt, reference, entity)
  is PromptPayCheckoutAdditionalInfo ->
    PromptPayCheckoutAdditionalInfoRN(expiration, qrCodeUrl, qrCodeBase64)
  else -> null
}
