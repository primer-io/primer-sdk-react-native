package com.primerioreactnative.extensions.klarna

import com.primerioreactnative.datamodels.klarna.KlarnaPaymentCollectableDataRN.FinalizePaymentRN
import com.primerioreactnative.datamodels.klarna.KlarnaPaymentCollectableDataRN.PaymentOptionsRN
import io.primer.android.klarna.api.composable.KlarnaPaymentCollectableData.FinalizePayment
import io.primer.android.klarna.api.composable.KlarnaPaymentCollectableData.PaymentOptions

internal fun PaymentOptions.toPaymentOptionsRN() =
  PaymentOptionsRN(
    returnIntentUrl = returnIntentUrl,
    paymentCategory = paymentCategory.toKlarnaPaymentCategoryRN(),
  )

internal fun FinalizePayment.toFinalizePaymentRN() = FinalizePaymentRN()
