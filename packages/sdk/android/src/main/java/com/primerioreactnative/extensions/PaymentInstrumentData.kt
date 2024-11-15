package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerPaymentInstrumentTokenRN
import io.primer.android.data.tokenization.models.PaymentInstrumentData

internal fun PaymentInstrumentData.toPaymentInstrumentDataRN() =
  PrimerPaymentInstrumentTokenRN.PaymentInstrumentData(
    network,
    cardholderName,
    first6Digits,
    last4Digits,
    expirationMonth,
    expirationYear,
    externalPayerInfo?.email?.let { PrimerPaymentInstrumentTokenRN.ExternalPayerInfo(it) },
    klarnaCustomerToken,
    sessionData?.let {
      PrimerPaymentInstrumentTokenRN.SessionData(
        it.recurringDescription,
        it.billingAddress?.let { PrimerPaymentInstrumentTokenRN.BillingAddress(it.email) })
    },
    paymentMethodType,
    binData?.let { PrimerPaymentInstrumentTokenRN.BinData(it.network) }
  )
