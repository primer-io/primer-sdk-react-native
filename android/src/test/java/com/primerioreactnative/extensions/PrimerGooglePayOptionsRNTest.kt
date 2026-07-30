package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerGooglePayOptionsRN
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

internal class PrimerGooglePayOptionsRNTest {
    @Test
    fun `null allowedCardTypes allows all card types`() {
        val options = PrimerGooglePayOptionsRN(allowedCardTypes = null).toPrimerGooglePayOptions()

        assertTrue(options.allowCreditCards)
        assertTrue(options.allowPrepaidCards)
    }

    @Test
    fun `empty allowedCardTypes allows all card types`() {
        val options = PrimerGooglePayOptionsRN(allowedCardTypes = emptyList()).toPrimerGooglePayOptions()

        assertTrue(options.allowCreditCards)
        assertTrue(options.allowPrepaidCards)
    }

    @Test
    fun `debit only disables credit and prepaid`() {
        val options = PrimerGooglePayOptionsRN(allowedCardTypes = listOf("debit")).toPrimerGooglePayOptions()

        assertFalse(options.allowCreditCards)
        assertFalse(options.allowPrepaidCards)
    }

    @Test
    fun `credit only keeps credit and disables prepaid`() {
        val options = PrimerGooglePayOptionsRN(allowedCardTypes = listOf("credit")).toPrimerGooglePayOptions()

        assertTrue(options.allowCreditCards)
        assertFalse(options.allowPrepaidCards)
    }

    @Test
    fun `prepaid only disables credit and keeps prepaid`() {
        val options = PrimerGooglePayOptionsRN(allowedCardTypes = listOf("prepaid")).toPrimerGooglePayOptions()

        assertFalse(options.allowCreditCards)
        assertTrue(options.allowPrepaidCards)
    }

    @Test
    fun `unknown values are dropped and fail open`() {
        val options =
            PrimerGooglePayOptionsRN(allowedCardTypes = listOf("CREDIT", "unknown"))
                .toPrimerGooglePayOptions()

        assertTrue(options.allowCreditCards)
        assertTrue(options.allowPrepaidCards)
    }

    @Test
    fun `all card types keep both flags enabled`() {
        val options =
            PrimerGooglePayOptionsRN(allowedCardTypes = listOf("credit", "debit", "prepaid"))
                .toPrimerGooglePayOptions()

        assertTrue(options.allowCreditCards)
        assertTrue(options.allowPrepaidCards)
    }
}
