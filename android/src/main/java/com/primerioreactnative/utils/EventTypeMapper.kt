package com.primerioreactnative.utils

import io.primer.android.components.analytics.data.model.EventType

internal fun toEventType(name: String, metadata: Map<String, String>?): EventType? {
    return when (name) {
        "SDK_INIT_START" -> EventType.SdkInitStart
        "SDK_INIT_END" -> EventType.SdkInitEnd
        "CHECKOUT_FLOW_STARTED" -> EventType.CheckoutFlowStarted
        "PAYMENT_FLOW_EXITED" -> EventType.PaymentFlowExited
        "PAYMENT_REATTEMPTED" -> EventType.PaymentReattempted

        "PAYMENT_METHOD_SELECTION" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            EventType.PaymentMethodSelection(paymentMethod)
        }
        "PAYMENT_DETAILS_ENTERED" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            EventType.PaymentDetailsEntered(paymentMethod)
        }
        "PAYMENT_SUBMITTED" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            EventType.PaymentSubmitted(paymentMethod)
        }
        "PAYMENT_PROCESSING_STARTED" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            EventType.PaymentProcessingStarted(paymentMethod)
        }
        "PAYMENT_SUCCESS" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            val paymentId = metadata["paymentId"] ?: return null
            EventType.PaymentSuccess(paymentMethod, paymentId)
        }
        "PAYMENT_FAILURE" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            val paymentId = metadata["paymentId"]
            EventType.PaymentFailure(paymentMethod, paymentId)
        }
        "PAYMENT_THREEDS" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            val threedsProvider = metadata["threedsProvider"] ?: return null
            val threedsResponse = metadata["threedsResponse"]
            EventType.PaymentThreeDS(paymentMethod, threedsProvider, threedsResponse)
        }
        "PAYMENT_REDIRECT_TO_THIRD_PARTY" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            val redirectDestinationUrl = metadata["redirectDestinationUrl"] ?: return null
            EventType.PaymentRedirect(paymentMethod, redirectDestinationUrl)
        }

        else -> null
    }
}
