package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.ThreeDsAuthenticationData
import io.primer.android.data.tokenization.models.*

internal fun AuthenticationDetails.toThreeDsAuthenticationDataRN() =
  ThreeDsAuthenticationData(
    it.responseCode.name,
    it.reasonCode,
    it.reasonText,
    it.protocolVersion,
    it.challengeIssued
  )
