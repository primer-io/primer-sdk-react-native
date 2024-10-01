package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.*
import io.primer.android.data.settings.*
import io.primer.android.data.settings.PrimerStripeOptions.MandateData.TemplateMandateData
import io.primer.android.data.settings.PrimerStripeOptions.MandateData.FullMandateData
import io.primer.android.data.settings.PrimerStripeOptions.MandateData.FullMandateStringData
import android.content.Context

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
        emailAddressRequired = emailAddressRequired
    )

fun PrimerGoogleShippingAddressParametersRN.toPrimerGoogleShippingAddressParameters() =
    PrimerGoogleShippingAddressParameters(phoneNumberRequired)

fun PrimerKlarnaOptionsRN.toPrimerKlarnaOptions() =
    PrimerKlarnaOptions(recurringPaymentDescription, webViewTitle)

fun PrimerThreeDsOptionsRN.toPrimerThreeDsOptions() =
    PrimerThreeDsOptions(threeDsOptionsAndroid?.threeDsAppRequestorUrl)

fun PrimerStripeOptionsRN.toPrimerStripeOptions(context: Context) =
    PrimerStripeOptions(mandateData = mandateData?.toMandateData(context), publishableKey = publishableKey)

private fun PrimerStripeOptionsRN.MandateDataRN.toMandateData(context: Context) = when {
    merchantName != null -> TemplateMandateData(merchantName)
    fullMandateStringResName != null -> {
        val stringId = context.getResources().getIdentifier(fullMandateStringResName, "string", context.getPackageName())
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
