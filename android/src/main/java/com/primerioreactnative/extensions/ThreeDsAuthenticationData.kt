package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerPaymentInstrumentTokenRN
import io.primer.android.domain.tokenization.models.PrimerPaymentMethodTokenData.AuthenticationDetails

internal fun AuthenticationDetails.toThreeDsAuthenticationDataRN() =
  PrimerPaymentInstrumentTokenRN.ThreeDSAuthenticationData(
    responseCode.name,
    reasonCode,
    reasonText,
    protocolVersion,
    challengeIssued
  )
