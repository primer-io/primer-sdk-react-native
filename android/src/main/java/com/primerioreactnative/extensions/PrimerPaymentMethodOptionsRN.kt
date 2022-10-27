package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.*
import io.primer.android.data.settings.*

fun PrimerPaymentMethodOptionsRN.toPrimerPaymentMethodOptions() = PrimerPaymentMethodOptions(
  androidSettingsRN.redirectScheme,
  cardPaymentOptions.toPrimerCardPaymentOptions(),
  googlePayOptions.toPrimerGooglePayOptions(),
  klarnaOptions.toPrimerKlarnaOptions(),
  apayaOptions.toPrimerApayaOptions(),
)

fun PrimerCardPaymentOptionsRN.toPrimerCardPaymentOptions() =
  PrimerCardPaymentOptions(is3DSOnVaultingEnabled)

fun PrimerGooglePayOptionsRN.toPrimerGooglePayOptions() =
  PrimerGooglePayOptions(merchantName, allowedCardNetworks, buttonStyle)

fun PrimerKlarnaOptionsRN.toPrimerKlarnaOptions() =
  PrimerKlarnaOptions(recurringPaymentDescription, webViewTitle)

fun PrimerApayaOptionsRN.toPrimerApayaOptions() = PrimerApayaOptions(webViewTitle)
