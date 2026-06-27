package com.primerioreactnative.utils

import io.primer.android.components.analytics.data.model.AnalyticsEvent
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

internal class AnalyticsEventMapperTest {

    @Nested
    inner class `data object events` {
        @Test
        fun `toAnalyticsEvent returns SdkInitStart`() {
            assertEquals(AnalyticsEvent.SdkInitStart, toAnalyticsEvent("SDK_INIT_START", null))
        }

        @Test
        fun `toAnalyticsEvent returns SdkInitEnd`() {
            assertEquals(AnalyticsEvent.SdkInitEnd, toAnalyticsEvent("SDK_INIT_END", null))
        }

        @Test
        fun `toAnalyticsEvent returns CheckoutFlowStarted`() {
            assertEquals(AnalyticsEvent.CheckoutFlowStarted, toAnalyticsEvent("CHECKOUT_FLOW_STARTED", null))
        }

        @Test
        fun `toAnalyticsEvent returns PaymentFlowExited`() {
            assertEquals(AnalyticsEvent.PaymentFlowExited, toAnalyticsEvent("PAYMENT_FLOW_EXITED", null))
        }

        @Test
        fun `toAnalyticsEvent returns PaymentReattempted`() {
            assertEquals(AnalyticsEvent.PaymentReattempted, toAnalyticsEvent("PAYMENT_REATTEMPTED", null))
        }

        @Test
        fun `toAnalyticsEvent ignores metadata for data object events`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertEquals(AnalyticsEvent.SdkInitStart, toAnalyticsEvent("SDK_INIT_START", metadata))
        }
    }

    @Nested
    inner class `PaymentMethodSelection event` {
        @Test
        fun `toAnalyticsEvent returns PaymentMethodSelection with paymentMethod`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertEquals(
                AnalyticsEvent.PaymentMethodSelection("PAYMENT_CARD"),
                toAnalyticsEvent("PAYMENT_METHOD_SELECTION", metadata),
            )
        }

        @Test
        fun `toAnalyticsEvent returns null when paymentMethod is missing`() {
            assertNull(toAnalyticsEvent("PAYMENT_METHOD_SELECTION", emptyMap()))
        }

        @Test
        fun `toAnalyticsEvent returns null when metadata is null`() {
            assertNull(toAnalyticsEvent("PAYMENT_METHOD_SELECTION", null))
        }
    }

    @Nested
    inner class `single-field data class events` {
        @Test
        fun `toAnalyticsEvent returns PaymentDetailsEntered`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertEquals(
                AnalyticsEvent.PaymentDetailsEntered("PAYMENT_CARD"),
                toAnalyticsEvent("PAYMENT_DETAILS_ENTERED", metadata),
            )
        }

        @Test
        fun `toAnalyticsEvent returns null for PaymentDetailsEntered without paymentMethod`() {
            assertNull(toAnalyticsEvent("PAYMENT_DETAILS_ENTERED", null))
        }

        @Test
        fun `toAnalyticsEvent returns PaymentSubmitted`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertEquals(
                AnalyticsEvent.PaymentSubmitted("PAYMENT_CARD"),
                toAnalyticsEvent("PAYMENT_SUBMITTED", metadata),
            )
        }

        @Test
        fun `toAnalyticsEvent returns null for PaymentSubmitted without paymentMethod`() {
            assertNull(toAnalyticsEvent("PAYMENT_SUBMITTED", null))
        }

        @Test
        fun `toAnalyticsEvent returns PaymentProcessingStarted`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertEquals(
                AnalyticsEvent.PaymentProcessingStarted("PAYMENT_CARD"),
                toAnalyticsEvent("PAYMENT_PROCESSING_STARTED", metadata),
            )
        }

        @Test
        fun `toAnalyticsEvent returns null for PaymentProcessingStarted without paymentMethod`() {
            assertNull(toAnalyticsEvent("PAYMENT_PROCESSING_STARTED", null))
        }
    }

    @Nested
    inner class `PaymentSuccess event` {
        @Test
        fun `toAnalyticsEvent returns PaymentSuccess with paymentMethod and paymentId`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD", "paymentId" to "abc123")
            assertEquals(
                AnalyticsEvent.PaymentSuccess("PAYMENT_CARD", "abc123"),
                toAnalyticsEvent("PAYMENT_SUCCESS", metadata),
            )
        }

        @Test
        fun `toAnalyticsEvent returns null when paymentId is missing`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertNull(toAnalyticsEvent("PAYMENT_SUCCESS", metadata))
        }

        @Test
        fun `toAnalyticsEvent returns null when paymentMethod is missing`() {
            val metadata = mapOf("paymentId" to "abc123")
            assertNull(toAnalyticsEvent("PAYMENT_SUCCESS", metadata))
        }
    }

    @Nested
    inner class `PaymentFailure event` {
        @Test
        fun `toAnalyticsEvent returns PaymentFailure with paymentMethod and paymentId`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD", "paymentId" to "abc123")
            assertEquals(
                AnalyticsEvent.PaymentFailure("PAYMENT_CARD", "abc123"),
                toAnalyticsEvent("PAYMENT_FAILURE", metadata),
            )
        }

        @Test
        fun `toAnalyticsEvent returns PaymentFailure with null paymentId when absent`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertEquals(
                AnalyticsEvent.PaymentFailure("PAYMENT_CARD", null),
                toAnalyticsEvent("PAYMENT_FAILURE", metadata),
            )
        }

        @Test
        fun `toAnalyticsEvent returns null when paymentMethod is missing`() {
            assertNull(toAnalyticsEvent("PAYMENT_FAILURE", emptyMap()))
        }
    }

    @Nested
    inner class `PaymentThreeDS event` {
        @Test
        fun `toAnalyticsEvent returns PaymentThreeDS with all fields`() {
            val metadata = mapOf(
                "paymentMethod" to "PAYMENT_CARD",
                "threedsProvider" to "ADYEN",
                "threedsResponse" to "CHALLENGE",
            )
            assertEquals(
                AnalyticsEvent.PaymentThreeDS("PAYMENT_CARD", "ADYEN", "CHALLENGE"),
                toAnalyticsEvent("PAYMENT_THREEDS", metadata),
            )
        }

        @Test
        fun `toAnalyticsEvent returns PaymentThreeDS with null threedsResponse`() {
            val metadata = mapOf(
                "paymentMethod" to "PAYMENT_CARD",
                "threedsProvider" to "ADYEN",
            )
            assertEquals(
                AnalyticsEvent.PaymentThreeDS("PAYMENT_CARD", "ADYEN", null),
                toAnalyticsEvent("PAYMENT_THREEDS", metadata),
            )
        }

        @Test
        fun `toAnalyticsEvent returns null when threedsProvider is missing`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertNull(toAnalyticsEvent("PAYMENT_THREEDS", metadata))
        }

        @Test
        fun `toAnalyticsEvent returns null when paymentMethod is missing`() {
            val metadata = mapOf("threedsProvider" to "ADYEN")
            assertNull(toAnalyticsEvent("PAYMENT_THREEDS", metadata))
        }
    }

    @Nested
    inner class `PaymentRedirect event` {
        @Test
        fun `toAnalyticsEvent returns PaymentRedirect with paymentMethod and url`() {
            val metadata = mapOf(
                "paymentMethod" to "PAYPAL",
                "redirectDestinationUrl" to "https://example.com",
            )
            assertEquals(
                AnalyticsEvent.PaymentRedirect("PAYPAL", "https://example.com"),
                toAnalyticsEvent("PAYMENT_REDIRECT_TO_THIRD_PARTY", metadata),
            )
        }

        @Test
        fun `toAnalyticsEvent returns null when redirectDestinationUrl is missing`() {
            val metadata = mapOf("paymentMethod" to "PAYPAL")
            assertNull(toAnalyticsEvent("PAYMENT_REDIRECT_TO_THIRD_PARTY", metadata))
        }

        @Test
        fun `toAnalyticsEvent returns null when paymentMethod is missing`() {
            val metadata = mapOf("redirectDestinationUrl" to "https://example.com")
            assertNull(toAnalyticsEvent("PAYMENT_REDIRECT_TO_THIRD_PARTY", metadata))
        }
    }

    @Nested
    inner class `unknown and edge cases` {
        @Test
        fun `toAnalyticsEvent returns null for unknown event name`() {
            assertNull(toAnalyticsEvent("UNKNOWN_EVENT", null))
        }

        @Test
        fun `toAnalyticsEvent returns null for empty event name`() {
            assertNull(toAnalyticsEvent("", null))
        }

        @Test
        fun `toAnalyticsEvent returns null for lowercase event name`() {
            assertNull(toAnalyticsEvent("sdk_init_start", null))
        }
    }
}
