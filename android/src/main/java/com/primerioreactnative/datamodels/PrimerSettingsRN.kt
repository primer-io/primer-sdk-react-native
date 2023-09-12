package com.primerioreactnative.datamodels

import com.primerioreactnative.extensions.toLocale
import com.primerioreactnative.extensions.toPrimerDebugOptions
import com.primerioreactnative.extensions.toPrimerPaymentMethodOptions
import com.primerioreactnative.extensions.toPrimerUIOptions
import io.primer.android.data.settings.GooglePayButtonStyle
import io.primer.android.data.settings.PrimerPaymentHandling
import io.primer.android.data.settings.PrimerSettings
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class PrimerSettingsRN(
  var paymentHandling: PrimerPaymentHandling = PrimerPaymentHandling.AUTO,
  var localeData: LocaleSettingsRN = LocaleSettingsRN(),
  var paymentMethodOptions: PrimerPaymentMethodOptionsRN = PrimerPaymentMethodOptionsRN(),
  var uiOptions: PrimerUIOptionsRN = PrimerUIOptionsRN(),
  var debugOptions: PrimerDebugOptionsRN = PrimerDebugOptionsRN(),
)

@Serializable
data class LocaleSettingsRN(
  val languageCode: String? = null,
  val localeCode: String? = null
)

@Serializable
data class PrimerPaymentMethodOptionsRN(
  @SerialName("android")
  val androidSettingsRN: AndroidSettingsRN = AndroidSettingsRN(),
  var cardPaymentOptions: PrimerCardPaymentOptionsRN = PrimerCardPaymentOptionsRN(),
  var googlePayOptions: PrimerGooglePayOptionsRN = PrimerGooglePayOptionsRN(),
  var klarnaOptions: PrimerKlarnaOptionsRN = PrimerKlarnaOptionsRN(),
  var apayaOptions: PrimerApayaOptionsRN = PrimerApayaOptionsRN(),
  var threeDsOptions: PrimerThreeDsOptionsRN = PrimerThreeDsOptionsRN()
)

@Serializable
data class AndroidSettingsRN(val redirectScheme: String? = null)

@Serializable
data class PrimerUIOptionsRN(
  var isInitScreenEnabled: Boolean = true,
  var isSuccessScreenEnabled: Boolean = true,
  var isErrorScreenEnabled: Boolean = true,
)

@Serializable
data class PrimerDebugOptionsRN(val is3DSSanityCheckEnabled: Boolean = true)

@Serializable
data class PrimerCardPaymentOptionsRN(
  var is3DSOnVaultingEnabled: Boolean = true
)

@Serializable
data class PrimerThreeDsOptionsRN(
  @SerialName("android")
  val threeDsOptionsAndroid: PrimerThreeDsAndroidOptionsRN? = null
)

@Serializable
data class PrimerThreeDsAndroidOptionsRN(
  val threeDsAppRequestorUrl: String? = null
)

@Serializable
data class PrimerGooglePayOptionsRN(
  var merchantName: String? = null,
  var allowedCardNetworks: List<String> = listOf(
    "AMEX",
    "DISCOVER",
    "JCB",
    "MASTERCARD",
    "VISA"
  ),
  var buttonStyle: GooglePayButtonStyle = GooglePayButtonStyle.BLACK,
  @SerialName("isCaptureBillingAddressEnabled") var captureBillingAddress: Boolean = false
)

@Serializable
data class PrimerKlarnaOptionsRN(
  var recurringPaymentDescription: String? = null,
  @Deprecated("This property is deprecated and will be removed in future release.")
  var webViewTitle: String? = null,
)

@Serializable
@Deprecated("This class is deprecated and will be removed in future release.")
data class PrimerApayaOptionsRN(
  var webViewTitle: String? = null,
)

fun PrimerSettingsRN.toPrimerSettings() = PrimerSettings(
  paymentHandling,
  localeData.toLocale(),
  paymentMethodOptions.toPrimerPaymentMethodOptions(),
  uiOptions.toPrimerUIOptions(),
  debugOptions.toPrimerDebugOptions()
)


