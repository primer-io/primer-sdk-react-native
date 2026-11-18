package com.primerioreactnative.extensions

import io.primer.android.data.tokenization.models.PaymentInstrumentData
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

internal class PaymentInstrumentDataRNTest {
    @Test
    fun `last four digits keep their leading zeros on the way to JS`() {
        val json =
            Json.encodeToString(
                PaymentInstrumentData(last4Digits = "0005", accountNumberLast4Digits = "0789")
                    .toPaymentInstrumentDataRN(),
            )

        assertTrue(json.contains("\"last4Digits\":\"0005\""))
        assertTrue(json.contains("\"accountNumberLast4Digits\":\"0789\""))
    }
}
