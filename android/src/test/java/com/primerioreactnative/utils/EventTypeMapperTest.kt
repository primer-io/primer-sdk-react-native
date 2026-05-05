package com.primerioreactnative.utils

import io.primer.android.components.analytics.data.model.EventType
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

internal class EventTypeMapperTest {

    @Nested
    inner class `data object events` {
        @Test
        fun `toEventType returns SdkInitStart`() {
            assertEquals(EventType.SdkInitStart, toEventType("SDK_INIT_START", null))
        }

        @Test
        fun `toEventType returns SdkInitEnd`() {
            assertEquals(EventType.SdkInitEnd, toEventType("SDK_INIT_END", null))
        }

        @Test
        fun `toEventType returns CheckoutFlowStarted`() {
            assertEquals(EventType.CheckoutFlowStarted, toEventType("CHECKOUT_FLOW_STARTED", null))
        }

        @Test
        fun `toEventType returns PaymentFlowExited`() {
            assertEquals(EventType.PaymentFlowExited, toEventType("PAYMENT_FLOW_EXITED", null))
        }

        @Test
        fun `toEventType returns PaymentReattempted`() {
            assertEquals(EventType.PaymentReattempted, toEventType("PAYMENT_REATTEMPTED", null))
        }

        @Test
        fun `toEventType ignores metadata for data object events`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertEquals(EventType.SdkInitStart, toEventType("SDK_INIT_START", metadata))
        }
    }

    @Nested
    inner class `PaymentMethodSelection event` {
        @Test
        fun `toEventType returns PaymentMethodSelection with paymentMethod`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertEquals(
                EventType.PaymentMethodSelection("PAYMENT_CARD"),
                toEventType("PAYMENT_METHOD_SELECTION", metadata),
            )
        }

        @Test
        fun `toEventType returns null when paymentMethod is missing`() {
            assertNull(toEventType("PAYMENT_METHOD_SELECTION", emptyMap()))
        }

        @Test
        fun `toEventType returns null when metadata is null`() {
            assertNull(toEventType("PAYMENT_METHOD_SELECTION", null))
        }
    }

    @Nested
    inner class `single-field data class events` {
        @Test
        fun `toEventType returns PaymentDetailsEntered`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertEquals(
                EventType.PaymentDetailsEntered("PAYMENT_CARD"),
                toEventType("PAYMENT_DETAILS_ENTERED", metadata),
            )
        }

        @Test
        fun `toEventType returns null for PaymentDetailsEntered without paymentMethod`() {
            assertNull(toEventType("PAYMENT_DETAILS_ENTERED", null))
        }

        @Test
        fun `toEventType returns PaymentSubmitted`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertEquals(
                EventType.PaymentSubmitted("PAYMENT_CARD"),
                toEventType("PAYMENT_SUBMITTED", metadata),
            )
        }

        @Test
        fun `toEventType returns null for PaymentSubmitted without paymentMethod`() {
            assertNull(toEventType("PAYMENT_SUBMITTED", null))
        }

        @Test
        fun `toEventType returns PaymentProcessingStarted`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertEquals(
                EventType.PaymentProcessingStarted("PAYMENT_CARD"),
                toEventType("PAYMENT_PROCESSING_STARTED", metadata),
            )
        }

        @Test
        fun `toEventType returns null for PaymentProcessingStarted without paymentMethod`() {
            assertNull(toEventType("PAYMENT_PROCESSING_STARTED", null))
        }
    }

    @Nested
    inner class `PaymentSuccess event` {
        @Test
        fun `toEventType returns PaymentSuccess with paymentMethod and paymentId`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD", "paymentId" to "abc123")
            assertEquals(
                EventType.PaymentSuccess("PAYMENT_CARD", "abc123"),
                toEventType("PAYMENT_SUCCESS", metadata),
            )
        }

        @Test
        fun `toEventType returns null when paymentId is missing`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertNull(toEventType("PAYMENT_SUCCESS", metadata))
        }

        @Test
        fun `toEventType returns null when paymentMethod is missing`() {
            val metadata = mapOf("paymentId" to "abc123")
            assertNull(toEventType("PAYMENT_SUCCESS", metadata))
        }
    }

    @Nested
    inner class `PaymentFailure event` {
        @Test
        fun `toEventType returns PaymentFailure with paymentMethod and paymentId`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD", "paymentId" to "abc123")
            assertEquals(
                EventType.PaymentFailure("PAYMENT_CARD", "abc123"),
                toEventType("PAYMENT_FAILURE", metadata),
            )
        }

        @Test
        fun `toEventType returns PaymentFailure with null paymentId when absent`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertEquals(
                EventType.PaymentFailure("PAYMENT_CARD", null),
                toEventType("PAYMENT_FAILURE", metadata),
            )
        }

        @Test
        fun `toEventType returns null when paymentMethod is missing`() {
            assertNull(toEventType("PAYMENT_FAILURE", emptyMap()))
        }
    }

    @Nested
    inner class `PaymentThreeDS event` {
        @Test
        fun `toEventType returns PaymentThreeDS with all fields`() {
            val metadata = mapOf(
                "paymentMethod" to "PAYMENT_CARD",
                "threedsProvider" to "ADYEN",
                "threedsResponse" to "CHALLENGE",
            )
            assertEquals(
                EventType.PaymentThreeDS("PAYMENT_CARD", "ADYEN", "CHALLENGE"),
                toEventType("PAYMENT_THREEDS", metadata),
            )
        }

        @Test
        fun `toEventType returns PaymentThreeDS with null threedsResponse`() {
            val metadata = mapOf(
                "paymentMethod" to "PAYMENT_CARD",
                "threedsProvider" to "ADYEN",
            )
            assertEquals(
                EventType.PaymentThreeDS("PAYMENT_CARD", "ADYEN", null),
                toEventType("PAYMENT_THREEDS", metadata),
            )
        }

        @Test
        fun `toEventType returns null when threedsProvider is missing`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertNull(toEventType("PAYMENT_THREEDS", metadata))
        }

        @Test
        fun `toEventType returns null when paymentMethod is missing`() {
            val metadata = mapOf("threedsProvider" to "ADYEN")
            assertNull(toEventType("PAYMENT_THREEDS", metadata))
        }
    }

    @Nested
    inner class `PaymentRedirect event` {
        @Test
        fun `toEventType returns PaymentRedirect with paymentMethod and url`() {
            val metadata = mapOf(
                "paymentMethod" to "PAYPAL",
                "redirectDestinationUrl" to "https://example.com",
            )
            assertEquals(
                EventType.PaymentRedirect("PAYPAL", "https://example.com"),
                toEventType("PAYMENT_REDIRECT_TO_THIRD_PARTY", metadata),
            )
        }

        @Test
        fun `toEventType returns null when redirectDestinationUrl is missing`() {
            val metadata = mapOf("paymentMethod" to "PAYPAL")
            assertNull(toEventType("PAYMENT_REDIRECT_TO_THIRD_PARTY", metadata))
        }

        @Test
        fun `toEventType returns null when paymentMethod is missing`() {
            val metadata = mapOf("redirectDestinationUrl" to "https://example.com")
            assertNull(toEventType("PAYMENT_REDIRECT_TO_THIRD_PARTY", metadata))
        }
    }

    @Nested
    inner class `unknown and edge cases` {
        @Test
        fun `toEventType returns null for unknown event name`() {
            assertNull(toEventType("UNKNOWN_EVENT", null))
        }

        @Test
        fun `toEventType returns null for empty event name`() {
            assertNull(toEventType("", null))
        }

        @Test
        fun `toEventType returns null for lowercase event name`() {
            assertNull(toEventType("sdk_init_start", null))
        }
    }
}
