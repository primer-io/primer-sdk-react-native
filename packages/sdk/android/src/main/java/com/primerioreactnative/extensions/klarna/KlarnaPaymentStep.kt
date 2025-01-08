package com.primerioreactnative.extensions.klarna

import com.primerioreactnative.datamodels.klarna.KlarnaPaymentStepRN.PaymentSessionAuthorizedRN
import com.primerioreactnative.datamodels.klarna.KlarnaPaymentStepRN.PaymentSessionCreatedRN
import com.primerioreactnative.datamodels.klarna.KlarnaPaymentStepRN.PaymentSessionFinalizedRN
import com.primerioreactnative.datamodels.klarna.KlarnaPaymentStepRN.PaymentViewLoadedRN
import io.primer.android.klarna.api.composable.KlarnaPaymentStep.PaymentSessionAuthorized
import io.primer.android.klarna.api.composable.KlarnaPaymentStep.PaymentSessionCreated
import io.primer.android.klarna.api.composable.KlarnaPaymentStep.PaymentSessionFinalized
import io.primer.android.klarna.api.composable.KlarnaPaymentStep.PaymentViewLoaded

internal fun PaymentSessionCreated.toPaymentSessionCreatedRN() =
  PaymentSessionCreatedRN(paymentCategories = paymentCategories.map { it.toKlarnaPaymentCategoryRN() })

internal fun PaymentViewLoaded.toPaymentViewLoadedRN() = PaymentViewLoadedRN()

internal fun PaymentSessionAuthorized.toPaymentSessionAuthorizedRN() = PaymentSessionAuthorizedRN(isFinalized = isFinalized)

internal fun PaymentSessionFinalized.toPaymentSessionFinalizedRN() = PaymentSessionFinalizedRN()
