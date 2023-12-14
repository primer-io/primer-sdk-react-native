package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.*
import io.primer.android.data.settings.*

fun PrimerPaymentMethodOptionsRN.toPrimerPaymentMethodOptions() = PrimerPaymentMethodOptions(
  androidSettingsRN.redirectScheme,
  googlePayOptions.toPrimerGooglePayOptions(),
  klarnaOptions.toPrimerKlarnaOptions(),
  apayaOptions.toPrimerApayaOptions(),
  threeDsOptions.toPrimerThreeDsOptions()
)

fun PrimerGooglePayOptionsRN.toPrimerGooglePayOptions() =
  PrimerGooglePayOptions(merchantName, allowedCardNetworks, buttonStyle, captureBillingAddress)

fun PrimerKlarnaOptionsRN.toPrimerKlarnaOptions() =
  PrimerKlarnaOptions(recurringPaymentDescription, webViewTitle)

fun PrimerApayaOptionsRN.toPrimerApayaOptions() = PrimerApayaOptions(webViewTitle)

fun PrimerThreeDsOptionsRN.toPrimerThreeDsOptions() =
  PrimerThreeDsOptions(threeDsOptionsAndroid?.threeDsAppRequestorUrl)
