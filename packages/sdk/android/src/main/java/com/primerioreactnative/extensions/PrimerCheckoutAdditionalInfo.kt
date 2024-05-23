package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.MultibancoCheckoutAdditionalInfoRN
import com.primerioreactnative.datamodels.PromptPayCheckoutAdditionalInfoRN
import com.primerioreactnative.datamodels.XenditCheckoutVoucherAdditionalInfoRN
import com.primerioreactnative.datamodels.AchAdditionalInfoDisplayMandateRN
import io.primer.android.domain.payments.additionalInfo.MultibancoCheckoutAdditionalInfo
import io.primer.android.domain.payments.additionalInfo.PrimerCheckoutAdditionalInfo
import io.primer.android.domain.payments.additionalInfo.PromptPayCheckoutAdditionalInfo
import io.primer.android.domain.payments.additionalInfo.XenditCheckoutVoucherAdditionalInfo
import io.primer.android.domain.payments.additionalInfo.AchAdditionalInfo

internal fun PrimerCheckoutAdditionalInfo.toCheckoutAdditionalInfoRN() = when (this) {
  is MultibancoCheckoutAdditionalInfo ->
    MultibancoCheckoutAdditionalInfoRN(expiresAt, reference, entity)
  is PromptPayCheckoutAdditionalInfo ->
    PromptPayCheckoutAdditionalInfoRN(expiresAt, qrCodeUrl, qrCodeBase64)
  is XenditCheckoutVoucherAdditionalInfo ->
    XenditCheckoutVoucherAdditionalInfoRN(expiresAt, couponCode, retailerName)
  is AchAdditionalInfo.DisplayMandate ->
    AchAdditionalInfoDisplayMandateRN
  else -> null
}
