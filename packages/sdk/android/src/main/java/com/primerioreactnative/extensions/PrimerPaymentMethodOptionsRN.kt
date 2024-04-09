package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.*
import io.primer.android.data.settings.*

fun PrimerPaymentMethodOptionsRN.toPrimerPaymentMethodOptions() = PrimerPaymentMethodOptions(
  androidSettingsRN.redirectScheme,
  googlePayOptions.toPrimerGooglePayOptions(),
  klarnaOptions.toPrimerKlarnaOptions(),
  threeDsOptions.toPrimerThreeDsOptions()
)

fun PrimerGooglePayOptionsRN.toPrimerGooglePayOptions() =
  PrimerGooglePayOptions(
    merchantName = merchantName,
    allowedCardNetworks = allowedCardNetworks,
    buttonStyle = buttonStyle,
    captureBillingAddress = captureBillingAddress,
    existingPaymentMethodRequired = existingPaymentMethodRequired
  )

fun PrimerKlarnaOptionsRN.toPrimerKlarnaOptions() =
  PrimerKlarnaOptions(recurringPaymentDescription, webViewTitle)

fun PrimerThreeDsOptionsRN.toPrimerThreeDsOptions() =
  PrimerThreeDsOptions(threeDsOptionsAndroid?.threeDsAppRequestorUrl)
