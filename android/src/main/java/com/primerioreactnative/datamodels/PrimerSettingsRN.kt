package com.primerioreactnative.datamodels

import io.primer.android.data.settings.*
import io.primer.android.ui.settings.PrimerUIOptions
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class PrimerSettingsRN(
  var paymentHandling: PrimerPaymentHandling = PrimerPaymentHandling.AUTO,
  var localeData: LocaleSettingsRN = LocaleSettingsRN(),
  var paymentMethodOptions: PrimerPaymentMethodOptionsRN = PrimerPaymentMethodOptionsRN(),
  var uiOptions: PrimerUIOptions = PrimerUIOptions(),
  var debugOptions: PrimerDebugOptions = PrimerDebugOptions(),
)

@Serializable
data class LocaleSettingsRN(
  val languageCode: String? = null,
  val localeCode: String? = null
)

fun LocaleSettingsRN.toLocale(): Locale {
  return when {
    languageCode == null -> Locale.getDefault()
    localeCode == null -> Locale(languageCode)
    else -> Locale(languageCode, localeCode)
  }
}

@Serializable
data class PrimerPaymentMethodOptionsRN(
  @SerialName("android")
  val androidSettingsRN: AndroidSettingsRN = AndroidSettingsRN(),
  var cardPaymentOptions: PrimerCardPaymentOptions = PrimerCardPaymentOptions(),
  var googlePayOptions: PrimerGooglePayOptions = PrimerGooglePayOptions(),
  var klarnaOptions: PrimerKlarnaOptions = PrimerKlarnaOptions(),
  var apayaOptions: PrimerApayaOptions = PrimerApayaOptions(),
  var goCardlessOptions: PrimerGoCardlessOptions = PrimerGoCardlessOptions()
)

fun PrimerPaymentMethodOptionsRN.toPrimerPaymentMethodOptions() = PrimerPaymentMethodOptions(
  androidSettingsRN.redirectScheme,
  cardPaymentOptions,
  googlePayOptions,
  klarnaOptions,
  apayaOptions,
  goCardlessOptions
)

@Serializable
data class AndroidSettingsRN(val redirectScheme: String? = null)

fun PrimerSettingsRN.toPrimerSettings() = PrimerSettings(
  paymentHandling,
  localeData.toLocale(),
  paymentMethodOptions.toPrimerPaymentMethodOptions(),
  uiOptions,
  debugOptions
)


