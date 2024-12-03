package com.primerioreactnative.extensions.klarna

import com.primerioreactnative.datamodels.klarna.KlarnaPaymentCollectableDataRN.PaymentOptionsRN
import com.primerioreactnative.datamodels.klarna.KlarnaPaymentCollectableDataRN.FinalizePaymentRN
import io.primer.android.klarna.api.composable.KlarnaPaymentCollectableData.PaymentOptions
import io.primer.android.klarna.api.composable.KlarnaPaymentCollectableData.FinalizePayment

internal fun PaymentOptions.toPaymentOptionsRN() =
    PaymentOptionsRN(
        returnIntentUrl = returnIntentUrl,
        paymentCategory = paymentCategory.toKlarnaPaymentCategoryRN()
    )

internal fun FinalizePayment.toFinalizePaymentRN() = FinalizePaymentRN()