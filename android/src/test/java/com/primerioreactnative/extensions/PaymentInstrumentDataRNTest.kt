package com.primerioreactnative.extensions

import io.primer.android.data.tokenization.models.PaymentInstrumentData
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

internal class PaymentInstrumentDataRNTest {
    @Test
    fun `last4Digits keeps its leading zeros on the way to JS`() {
        val rn = PaymentInstrumentData(last4Digits = "0005").toPaymentInstrumentDataRN()

        assertTrue(Json.encodeToString(rn).contains("\"last4Digits\":\"0005\""))
    }
}
