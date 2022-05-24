package com.primerioreactnative.datamodels

import io.primer.android.data.configuration.models.PrimerPaymentMethodType
import io.primer.android.domain.tokenization.models.PrimerPaymentMethodData
import kotlinx.serialization.Serializable

@Serializable
data class PrimerPaymentMethodDataRN(val paymentMethodType: PrimerPaymentMethodType)

fun PrimerPaymentMethodData.toPrimerPaymentMethodDataRN() =
  PrimerPaymentMethodDataRN(paymentMethodType)
