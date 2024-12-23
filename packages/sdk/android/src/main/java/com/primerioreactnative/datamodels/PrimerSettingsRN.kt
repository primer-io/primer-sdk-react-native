package com.primerioreactnative.datamodels

import android.content.Context
import com.google.android.gms.wallet.button.ButtonConstants
import com.primerioreactnative.extensions.toLocale
import com.primerioreactnative.extensions.toPrimerDebugOptions
import com.primerioreactnative.extensions.toPrimerPaymentMethodOptions
import com.primerioreactnative.extensions.toPrimerUIOptions
import io.primer.android.data.settings.GooglePayButtonStyle
import io.primer.android.data.settings.PrimerPaymentHandling
import io.primer.android.data.settings.PrimerSettings
import io.primer.android.data.settings.PrimerStripeOptions
import io.primer.android.ui.settings.PrimerTheme
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class PrimerSettingsRN(
  var paymentHandling: PrimerPaymentHandling = PrimerPaymentHandling.AUTO,
  var localeData: LocaleSettingsRN = LocaleSettingsRN(),
  var paymentMethodOptions: PrimerPaymentMethodOptionsRN = PrimerPaymentMethodOptionsRN(),
  var uiOptions: PrimerUIOptionsRN = PrimerUIOptionsRN(),
  var debugOptions: PrimerDebugOptionsRN = PrimerDebugOptionsRN(),
  var clientSessionCachingEnabled: Boolean = false
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
  var threeDsOptions: PrimerThreeDsOptionsRN = PrimerThreeDsOptionsRN(),
  var stripeOptions: PrimerStripeOptionsRN = PrimerStripeOptionsRN(),
)

@Serializable
data class AndroidSettingsRN(val redirectScheme: String? = null)

@Serializable
data class PrimerUIOptionsRN(
  var isInitScreenEnabled: Boolean = true,
  var isSuccessScreenEnabled: Boolean = true,
  var isErrorScreenEnabled: Boolean = true,
  var theme: PrimerThemeRN = PrimerThemeRN()
)

@Serializable
data class PrimerThemeRN(
  val colors: ColorThemeRN? = null,
  val darkModeColors: ColorThemeRN? = null
) {
  fun toPrimerTheme(): PrimerTheme {
    val isDarkMode = false

    return PrimerTheme.buildWithDynamicValues(
      isDarkMode = isDarkMode,
      mainColor = when {
        isDarkMode -> darkModeColors?.mainColor?.toHexStrColor()
        else -> colors?.mainColor?.toHexStrColor()
      },
      backgroundColor = when {
        isDarkMode -> darkModeColors?.background?.toHexStrColor()
        else -> colors?.background?.toHexStrColor()
      },
      disabledColor = when {
        isDarkMode -> darkModeColors?.disabled?.toHexStrColor()
        else -> colors?.disabled?.toHexStrColor()
      },
      textColor = when {
        isDarkMode -> darkModeColors?.text?.toHexStrColor()
        else -> colors?.text?.toHexStrColor()
      },
      bordersColor = when {
        isDarkMode -> darkModeColors?.borders?.toHexStrColor()
        else -> colors?.borders?.toHexStrColor()
      },
      errorColor = when {
        isDarkMode -> darkModeColors?.error?.toHexStrColor()
        else -> colors?.error?.toHexStrColor()
      }
    )
  }
}

@Serializable
data class ColorThemeRN(
  val mainColor: ColorRN? = null,
  val contrastingColor: ColorRN? = null,
  val background: ColorRN? = null,
  val text: ColorRN? = null,
  val contrastingText: ColorRN? = null,
  val borders: ColorRN? = null, // or main color
  val disabled: ColorRN? = null,
  val error: ColorRN? = null,
)

@Serializable
data class ColorRN(
  val alpha: Int = 0,
  val red: Int = 0,
  val green: Int = 0,
  val blue: Int = 0
) {
  fun toHexStrColor() = String.format("#%02X%02X%02X%02X", alpha, red, green, blue)
}

@Serializable
data class PrimerDebugOptionsRN(val is3DSSanityCheckEnabled: Boolean = true)

@Serializable
data class PrimerCardPaymentOptionsRN(var is3DSOnVaultingEnabled: Boolean = true)

@Serializable
data class PrimerThreeDsOptionsRN(
  @SerialName("android")
  val threeDsOptionsAndroid: PrimerThreeDsAndroidOptionsRN? = null
)

@Serializable
data class PrimerThreeDsAndroidOptionsRN(val threeDsAppRequestorUrl: String? = null)

@Serializable
data class PrimerGooglePayOptionsRN(
  var merchantName: String? = null,
  var allowedCardNetworks: List<String> =
    listOf("AMEX", "DISCOVER", "JCB", "MASTERCARD", "VISA"),
  var buttonStyle: GooglePayButtonStyle = GooglePayButtonStyle.BLACK,
  @SerialName("isCaptureBillingAddressEnabled")
  var captureBillingAddress: Boolean = false,
  @SerialName("isExistingPaymentMethodRequired")
  var existingPaymentMethodRequired: Boolean = false,
  var shippingAddressParameters: PrimerGoogleShippingAddressParametersRN? = null,
  @SerialName("requireShippingMethod")
  var requireShippingMethod: Boolean = false,
  @SerialName("emailAddressRequired")
  var emailAddressRequired: Boolean = false,
  @SerialName("buttonOptions")
  var buttonOptions: PrimerGooglePayButtonOptionsRN? = null
)

@Serializable
data class PrimerGoogleShippingAddressParametersRN(
  var phoneNumberRequired: Boolean = false
)

@Serializable
data class PrimerGooglePayButtonOptionsRN(
  @SerialName("buttonTheme")
  var buttonTheme: Int? = null,
  @SerialName("buttonType")
  var buttonType: Int? = null
)

@Serializable
data class PrimerKlarnaOptionsRN(
  var recurringPaymentDescription: String? = null,
  @Deprecated("This property is deprecated and will be removed in future release.")
  var webViewTitle: String? = null,
)

@Serializable
data class PrimerStripeOptionsRN(
  val mandateData: MandateDataRN? = null,
  val publishableKey: String? = null,
) {
  @Serializable
  data class MandateDataRN(
    @SerialName("fullMandateText") val fullMandateText: String? = null,
    @SerialName("fullMandateStringResourceName") val fullMandateStringResName: String? = null,
    val merchantName: String? = null
  )
}

@Serializable
@Deprecated("This class is deprecated and will be removed in future release.")
data class PrimerApayaOptionsRN(
  var webViewTitle: String? = null,
)

fun PrimerSettingsRN.toPrimerSettings(context: Context) = PrimerSettings(
  paymentHandling = paymentHandling,
  locale = localeData.toLocale(),
  paymentMethodOptions = paymentMethodOptions.toPrimerPaymentMethodOptions(context),
  uiOptions = uiOptions.toPrimerUIOptions(),
  debugOptions = debugOptions.toPrimerDebugOptions(),
  clientSessionCachingEnabled = clientSessionCachingEnabled
)
