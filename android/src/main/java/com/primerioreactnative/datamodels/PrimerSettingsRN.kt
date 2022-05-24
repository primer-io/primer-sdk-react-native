package com.primerioreactnative.datamodels

import io.primer.android.data.settings.PrimerDebugOptions
import io.primer.android.data.settings.PrimerPaymentHandling
import io.primer.android.data.settings.PrimerPaymentMethodOptions
import io.primer.android.data.settings.PrimerSettings
import io.primer.android.ui.settings.PrimerUIOptions
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class PrimerSettingsRN(
  @SerialName("android")
  var androidSettings: AndroidSettingsRN = AndroidSettingsRN(),
  var paymentHandling: PrimerPaymentHandling = PrimerPaymentHandling.AUTO,
  var localeData: LocaleSettingsRN = LocaleSettingsRN(),
  var paymentMethodOptions: PrimerPaymentMethodOptions = PrimerPaymentMethodOptions(),
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
data class AndroidSettingsRN(val redirectSchema: String? = null)

fun PrimerSettingsRN.toPrimerSettings() = PrimerSettings(
  paymentHandling, localeData.toLocale(),
  paymentMethodOptions, uiOptions, debugOptions
)


