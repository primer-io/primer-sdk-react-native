package com.primerioreactnative.extensions

import android.content.Context
import com.google.android.gms.wallet.button.ButtonConstants
import com.primerioreactnative.datamodels.PrimerGooglePayButtonOptionsRN
import com.primerioreactnative.datamodels.PrimerGooglePayOptionsRN
import com.primerioreactnative.datamodels.PrimerGoogleShippingAddressParametersRN
import com.primerioreactnative.datamodels.PrimerKlarnaOptionsRN
import com.primerioreactnative.datamodels.PrimerPaymentMethodOptionsRN
import com.primerioreactnative.datamodels.PrimerStripeOptionsRN
import com.primerioreactnative.datamodels.PrimerThreeDsOptionsRN
import io.primer.android.data.settings.GooglePayButtonOptions
import io.primer.android.data.settings.PrimerGooglePayOptions
import io.primer.android.data.settings.PrimerGoogleShippingAddressParameters
import io.primer.android.data.settings.PrimerKlarnaOptions
import io.primer.android.data.settings.PrimerPaymentMethodOptions
import io.primer.android.data.settings.PrimerStripeOptions
import io.primer.android.data.settings.PrimerStripeOptions.MandateData.FullMandateData
import io.primer.android.data.settings.PrimerStripeOptions.MandateData.FullMandateStringData
import io.primer.android.data.settings.PrimerStripeOptions.MandateData.TemplateMandateData
import io.primer.android.data.settings.PrimerThreeDsOptions

fun PrimerPaymentMethodOptionsRN.toPrimerPaymentMethodOptions(context: Context) =
  PrimerPaymentMethodOptions(
    androidSettingsRN.redirectScheme,
    googlePayOptions.toPrimerGooglePayOptions(),
    klarnaOptions.toPrimerKlarnaOptions(),
    threeDsOptions.toPrimerThreeDsOptions(),
    stripeOptions.toPrimerStripeOptions(context),
  )

fun PrimerGooglePayOptionsRN.toPrimerGooglePayOptions() =
  PrimerGooglePayOptions(
    merchantName = merchantName,
    allowedCardNetworks = allowedCardNetworks,
    buttonStyle = buttonStyle,
    captureBillingAddress = captureBillingAddress,
    existingPaymentMethodRequired = existingPaymentMethodRequired,
    shippingAddressParameters = shippingAddressParameters?.toPrimerGoogleShippingAddressParameters(),
    requireShippingMethod = requireShippingMethod,
    emailAddressRequired = emailAddressRequired,
    buttonOptions = buttonOptions?.toPrimerGooglePayButtonOptions() ?: GooglePayButtonOptions(),
  )

fun PrimerGoogleShippingAddressParametersRN.toPrimerGoogleShippingAddressParameters() =
  PrimerGoogleShippingAddressParameters(phoneNumberRequired)

fun PrimerGooglePayButtonOptionsRN.toPrimerGooglePayButtonOptions() =
  GooglePayButtonOptions(
    buttonType = buttonType ?: ButtonConstants.ButtonType.PAY,
    buttonTheme = buttonTheme ?: ButtonConstants.ButtonTheme.DARK,
  )

fun PrimerKlarnaOptionsRN.toPrimerKlarnaOptions() = PrimerKlarnaOptions(recurringPaymentDescription, webViewTitle)

fun PrimerThreeDsOptionsRN.toPrimerThreeDsOptions() = PrimerThreeDsOptions(threeDsOptionsAndroid?.threeDsAppRequestorUrl)

fun PrimerStripeOptionsRN.toPrimerStripeOptions(context: Context) =
  PrimerStripeOptions(
    mandateData = mandateData?.toMandateData(context),
    publishableKey = publishableKey,
  )

private fun PrimerStripeOptionsRN.MandateDataRN.toMandateData(context: Context) =
  when {
    merchantName != null -> TemplateMandateData(merchantName)
    fullMandateStringResName != null -> {
      val stringId =
        context.getResources()
          .getIdentifier(fullMandateStringResName, "string", context.getPackageName())
      if (stringId != 0) {
        FullMandateData(stringId)
      } else {
        if (fullMandateText != null) {
          FullMandateStringData(fullMandateText)
        } else {
          error("Missing mandate data")
        }
      }
    }

    fullMandateText != null -> FullMandateStringData(fullMandateText)
    else -> error("Missing mandate data")
  }
