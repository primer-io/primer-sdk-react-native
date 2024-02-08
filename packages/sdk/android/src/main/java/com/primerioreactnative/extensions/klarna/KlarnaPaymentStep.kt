package com.primerioreactnative.extensions.klarna

import com.primerioreactnative.datamodels.klarna.KlarnaPaymentStepRN.PaymentSessionCreatedRN
import com.primerioreactnative.datamodels.klarna.KlarnaPaymentStepRN.PaymentSessionAuthorizedRN
import com.primerioreactnative.extensions.klarna.toKlarnaPaymentCategoryRN
import io.primer.android.components.presentation.paymentMethods.nativeUi.klarna.models.KlarnaPaymentStep.PaymentSessionCreated
import io.primer.android.components.presentation.paymentMethods.nativeUi.klarna.models.KlarnaPaymentStep.PaymentSessionAuthorized

internal fun PaymentSessionCreated.toPaymentSessionCreatedRN() =
    PaymentSessionCreatedRN(paymentCategories = paymentCategories.map { it.toKlarnaPaymentCategoryRN() })

internal fun PaymentSessionAuthorized.toPaymentSessionAuthorizedRN() =
    PaymentSessionAuthorizedRN(isFinalized = isFinalized)