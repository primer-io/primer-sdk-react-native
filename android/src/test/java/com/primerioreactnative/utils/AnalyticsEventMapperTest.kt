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
    }

    @Nested
    inner class `PaymentReattempted event` {
        @Test
        fun `toAnalyticsEvent returns PaymentReattempted with null paymentMethod when absent`() {
            assertEquals(AnalyticsEvent.PaymentReattempted(null), toAnalyticsEvent("PAYMENT_REATTEMPTED", null))
        }
    }

    @Nested
    inner class `PaymentMethodSelection event` {
        @Test
        fun `toAnalyticsEvent returns null when paymentMethod is missing`() {
            assertNull(toAnalyticsEvent("PAYMENT_METHOD_SELECTION", emptyMap()))
            assertNull(toAnalyticsEvent("PAYMENT_METHOD_SELECTION", null))
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
    }

    @Nested
    inner class `PaymentFailure event` {
        @Test
        fun `toAnalyticsEvent returns PaymentFailure with null paymentId when absent`() {
            val metadata = mapOf("paymentMethod" to "PAYMENT_CARD")
            assertEquals(
                AnalyticsEvent.PaymentFailure("PAYMENT_CARD", null),
                toAnalyticsEvent("PAYMENT_FAILURE", metadata),
            )
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
    }

    @Nested
    inner class `Vault events` {
        @Test
        fun `toAnalyticsEvent returns VaultListOpened with vaultedMethodId, null when empty`() {
            assertEquals(
                AnalyticsEvent.VaultListOpened("vm-1"),
                toAnalyticsEvent("VAULT_LIST_OPENED", mapOf("vaultedMethodId" to "vm-1")),
            )
            assertEquals(
                AnalyticsEvent.VaultListOpened(null),
                toAnalyticsEvent("VAULT_LIST_OPENED", mapOf("vaultedMethodId" to "")),
            )
        }

        @Test
        fun `toAnalyticsEvent parses vaultedMethodCount as Int`() {
            assertEquals(
                AnalyticsEvent.VaultEditModeEntered(3),
                toAnalyticsEvent("VAULT_EDIT_MODE_ENTERED", mapOf("vaultedMethodCount" to "3")),
            )
        }

        @Test
        fun `toAnalyticsEvent parses exitedFromConfirmation as Boolean`() {
            assertEquals(
                AnalyticsEvent.VaultEditModeExited(true),
                toAnalyticsEvent("VAULT_EDIT_MODE_EXITED", mapOf("exitedFromConfirmation" to "true")),
            )
        }
    }

    @Nested
    inner class `unknown and edge cases` {
        @Test
        fun `toAnalyticsEvent returns null for unknown event name`() {
            assertNull(toAnalyticsEvent("UNKNOWN_EVENT", null))
        }
    }
}
