package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerPaymentInstrumentTokenRN
import io.primer.android.data.tokenization.models.PaymentInstrumentData

internal fun PaymentInstrumentData.toPaymentInstrumentDataRN() =
  PrimerPaymentInstrumentTokenRN.PaymentInstrumentData(
    network = network,
    cardholderName = cardholderName,
    first6Digits = first6Digits,
    last4Digits = last4Digits,
    accountNumberLast4Digits = accountNumberLast4Digits,
    expirationMonth = expirationMonth,
    expirationYear = expirationYear,
    externalPayerInfo =
      externalPayerInfo?.let {
        PrimerPaymentInstrumentTokenRN.ExternalPayerInfo(
          email = it.email,
          externalPayerId = it.externalPayerId,
          firstName = it.firstName,
          lastName = it.lastName,
        )
      },
    klarnaCustomerToken = klarnaCustomerToken,
    sessionData =
      sessionData?.let {
        PrimerPaymentInstrumentTokenRN.SessionData(
          recurringDescription = it.recurringDescription,
          billingAddress =
            it.billingAddress?.let {
              PrimerPaymentInstrumentTokenRN.BillingAddress(
                email = it.email,
              )
            },
        )
      },
    paymentMethodType = paymentMethodType,
    binData =
      binData?.let {
        PrimerPaymentInstrumentTokenRN.BinData(network = it.network)
      },
    bankName = bankName,
  )
