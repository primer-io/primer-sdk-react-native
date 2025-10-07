package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerPaymentRN
import io.primer.android.domain.payments.create.model.Payment

internal fun Payment.toPrimerPaymentRN() = PrimerPaymentRN(id, orderId)
