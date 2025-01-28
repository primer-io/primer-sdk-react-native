package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerPaymentMethodDataRN
import io.primer.android.domain.tokenization.models.PrimerPaymentMethodData

internal fun PrimerPaymentMethodData.toPrimerPaymentMethodDataRN() =
    PrimerPaymentMethodDataRN(
        paymentMethodType,
        paymentMethodType,
    )
