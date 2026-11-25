package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerClientSessionRN
import io.primer.android.components.bridge.clientsession.ComponentsNetworkOption
import io.primer.android.components.bridge.clientsession.ComponentsPaymentMethodOption
import io.primer.android.domain.action.models.PrimerClientSession
import io.primer.android.domain.action.models.PrimerFee
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

internal class PrimerClientSessionTest {
    @Test
    fun `fees reach JS as sent, zero and untyped ones included`() {
        val session = clientSession(fees = listOf(PrimerFee("SURCHARGE", 50), PrimerFee(null, 0)))

        val json = toJson(session.toPrimerClientSessionRN())

        assertEquals(
            Json.parseToJsonElement("""[{"type":"SURCHARGE","amount":50},{"type":null,"amount":0}]"""),
            json["fees"],
        )
    }

    @Test
    fun `payment method options reach JS by type, with method and network surcharges and zeros kept`() {
        val options =
            listOf(
                ComponentsPaymentMethodOption(type = "PAYPAL", surcharge = 0, networks = emptyList()),
                ComponentsPaymentMethodOption(
                    type = "PAYMENT_CARD",
                    surcharge = null,
                    networks = listOf(
                        ComponentsNetworkOption(type = "VISA", surcharge = 0),
                        ComponentsNetworkOption(type = "CARTES_BANCAIRES", surcharge = 20),
                        ComponentsNetworkOption(type = "MASTERCARD", surcharge = null),
                    ),
                ),
                ComponentsPaymentMethodOption(type = "APPLE_PAY", surcharge = 99, networks = emptyList()),
            )

        val json = toJson(clientSession(fees = null).toPrimerClientSessionRN(paymentMethodOptions = options))

        assertEquals(
            Json.parseToJsonElement(
                """
                {
                  "PAYPAL": {"surcharge": {"amount": 0}, "networks": {}},
                  "PAYMENT_CARD": {
                    "networks": {
                      "VISA": {"surcharge": {"amount": 0}},
                      "CARTES_BANCAIRES": {"surcharge": {"amount": 20}},
                      "MASTERCARD": {}
                    }
                  },
                  "APPLE_PAY": {"surcharge": {"amount": 99}, "networks": {}}
                }
                """,
            ),
            json["paymentMethodOptions"],
        )
    }

    private fun toJson(session: PrimerClientSessionRN): JsonObject =
        Json.parseToJsonElement(Json.encodeToString(session)).jsonObject

    private fun clientSession(fees: List<PrimerFee>?) =
        PrimerClientSession(
            customerId = "customer",
            orderId = "order",
            currencyCode = "GBP",
            totalAmount = 1050,
            lineItems = null,
            orderDetails = null,
            customer = null,
            paymentMethod = null,
            fees = fees,
        )
}
