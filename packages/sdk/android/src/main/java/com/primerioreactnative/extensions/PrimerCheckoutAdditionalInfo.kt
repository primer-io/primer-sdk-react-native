package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.MultibancoCheckoutAdditionalInfoRN
import com.primerioreactnative.datamodels.PromptPayCheckoutAdditionalInfoRN
import com.primerioreactnative.datamodels.XenditCheckoutVoucherAdditionalInfoRN
import com.primerioreactnative.datamodels.AchAdditionalInfoDisplayMandateRN
import io.primer.android.vouchers.multibanco.MultibancoCheckoutAdditionalInfo
import io.primer.android.payments.core.additionalInfo.PrimerCheckoutAdditionalInfo
import io.primer.android.qrcode.QrCodeCheckoutAdditionalInfo
import io.primer.android.vouchers.retailOutlets.XenditCheckoutVoucherAdditionalInfo
import io.primer.android.stripe.ach.api.additionalInfo.AchAdditionalInfo

internal fun PrimerCheckoutAdditionalInfo.toCheckoutAdditionalInfoRN() = when (this) {
  is MultibancoCheckoutAdditionalInfo ->
    MultibancoCheckoutAdditionalInfoRN(expiresAt, reference, entity)
  is QrCodeCheckoutAdditionalInfo ->
  PromptPayCheckoutAdditionalInfoRN(expiresAt.orEmpty(), qrCodeUrl, qrCodeBase64)
  is XenditCheckoutVoucherAdditionalInfo ->
    XenditCheckoutVoucherAdditionalInfoRN(expiresAt, couponCode, retailerName)
  is AchAdditionalInfo.DisplayMandate ->
    AchAdditionalInfoDisplayMandateRN()
  else -> null
}
