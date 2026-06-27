package com.primerioreactnative.utils

import io.primer.android.components.analytics.data.model.AnalyticsEvent

@Suppress("CyclomaticComplexMethod", "ReturnCount")
internal fun toAnalyticsEvent(name: String, metadata: Map<String, String>?): AnalyticsEvent? {
    return when (name) {
        "SDK_INIT_START" -> AnalyticsEvent.SdkInitStart
        "SDK_INIT_END" -> AnalyticsEvent.SdkInitEnd
        "CHECKOUT_FLOW_STARTED" -> AnalyticsEvent.CheckoutFlowStarted
        "PAYMENT_FLOW_EXITED" -> AnalyticsEvent.PaymentFlowExited
        "PAYMENT_REATTEMPTED" -> AnalyticsEvent.PaymentReattempted

        "PAYMENT_METHOD_SELECTION" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            AnalyticsEvent.PaymentMethodSelection(paymentMethod)
        }
        "PAYMENT_DETAILS_ENTERED" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            AnalyticsEvent.PaymentDetailsEntered(paymentMethod)
        }
        "PAYMENT_SUBMITTED" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            AnalyticsEvent.PaymentSubmitted(paymentMethod)
        }
        "PAYMENT_PROCESSING_STARTED" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            AnalyticsEvent.PaymentProcessingStarted(paymentMethod)
        }
        "PAYMENT_SUCCESS" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            val paymentId = metadata["paymentId"] ?: return null
            AnalyticsEvent.PaymentSuccess(paymentMethod, paymentId)
        }
        "PAYMENT_FAILURE" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            val paymentId = metadata["paymentId"]
            AnalyticsEvent.PaymentFailure(paymentMethod, paymentId)
        }
        "PAYMENT_THREEDS" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            val threedsProvider = metadata["threedsProvider"] ?: return null
            val threedsResponse = metadata["threedsResponse"]
            AnalyticsEvent.PaymentThreeDS(paymentMethod, threedsProvider, threedsResponse)
        }
        "PAYMENT_REDIRECT_TO_THIRD_PARTY" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            val redirectDestinationUrl = metadata["redirectDestinationUrl"] ?: return null
            AnalyticsEvent.PaymentRedirect(paymentMethod, redirectDestinationUrl)
        }

        else -> null
    }
}
