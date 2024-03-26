package com.primerioreactnative.extensions.klarna

import com.primerioreactnative.datamodels.klarna.KlarnaPaymentCollectableDataRN.PaymentOptionsRN
import com.primerioreactnative.datamodels.klarna.KlarnaPaymentCollectableDataRN.FinalizePaymentRN
import io.primer.android.components.presentation.paymentMethods.nativeUi.klarna.models.KlarnaPaymentCollectableData.PaymentOptions
import io.primer.android.components.presentation.paymentMethods.nativeUi.klarna.models.KlarnaPaymentCollectableData.FinalizePayment

internal fun PaymentOptions.toPaymentOptionsRN() =
    PaymentOptionsRN(
        returnIntentUrl = returnIntentUrl,
        paymentCategory = paymentCategory.toKlarnaPaymentCategoryRN()
    )

internal fun FinalizePayment.toFinalizePaymentRN() = FinalizePaymentRN()