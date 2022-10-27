package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.*
import io.primer.android.data.settings.*

fun PrimerPaymentMethodOptionsRN.toPrimerPaymentMethodOptions() = PrimerPaymentMethodOptions(
  androidSettingsRN.redirectScheme,
  googlePayOptions.toPrimerGooglePayOptions(),
  klarnaOptions.toPrimerKlarnaOptions(),
  apayaOptions.toPrimerApayaOptions(),
  goCardlessOptions.toPrimerGoCardlessOptions()
)

fun PrimerGooglePayOptionsRN.toPrimerGooglePayOptions() =
  PrimerGooglePayOptions(merchantName, allowedCardNetworks, buttonStyle)

fun PrimerKlarnaOptionsRN.toPrimerKlarnaOptions() =
  PrimerKlarnaOptions(recurringPaymentDescription, webViewTitle)

fun PrimerApayaOptionsRN.toPrimerApayaOptions() = PrimerApayaOptions(webViewTitle)

fun PrimerGoCardlessOptionsRN.toPrimerGoCardlessOptions() =
  PrimerGoCardlessOptions(businessName, businessAddress)
