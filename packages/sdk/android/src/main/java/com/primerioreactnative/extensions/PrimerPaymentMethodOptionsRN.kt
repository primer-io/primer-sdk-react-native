package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.*
import io.primer.android.data.settings.*
import io.primer.android.data.settings.PrimerStripeOptions.MandateData.TemplateMandateData
import io.primer.android.data.settings.PrimerStripeOptions.MandateData.FullMandateData
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
        existingPaymentMethodRequired = existingPaymentMethodRequired
    )

fun PrimerKlarnaOptionsRN.toPrimerKlarnaOptions() =
    PrimerKlarnaOptions(recurringPaymentDescription, webViewTitle)

fun PrimerThreeDsOptionsRN.toPrimerThreeDsOptions() =
    PrimerThreeDsOptions(threeDsOptionsAndroid?.threeDsAppRequestorUrl)

fun PrimerStripeOptionsRN.toPrimerStripeOptions(context: Context) = 
    PrimerStripeOptions(mandateData = mandateData?.toMandateData(context), publishableKey = publishableKey)

private fun PrimerStripeOptionsRN.MandateDataRN.toMandateData(context: Context) = when {
    merchantName != null -> TemplateMandateData(merchantName)
    fullMandateStringResName != null -> FullMandateData(
        context.getResources().getIdentifier(fullMandateStringResName, "string", context.getPackageName())
    )
    else -> error("Missing mandate data")
}