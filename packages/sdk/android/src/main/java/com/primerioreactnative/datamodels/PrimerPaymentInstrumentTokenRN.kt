package com.primerioreactnative.datamodels

import com.primerioreactnative.extensions.toPaymentInstrumentDataRN
import io.primer.android.data.tokenization.models.TokenType
import io.primer.android.domain.tokenization.models.PrimerPaymentMethodTokenData
import kotlinx.serialization.Serializable

@Serializable
data class PrimerPaymentInstrumentTokenRN(
    val token: String,
    val analyticsId: String,
    val tokenType: TokenType,
    val paymentInstrumentType: String,
    val paymentInstrumentData: PaymentInstrumentData? = null,
    val threeDSecureAuthentication: ThreeDSAuthenticationData? = null,
    val vaultData: VaultData? = null,
) {
    @Serializable
    data class VaultData(
        val customerId: String,
    )

    @Serializable
    data class ThreeDSAuthenticationData(
        val responseCode: String?,
        val reasonCode: String?,
        val reasonText: String?,
        val protocolVersion: String?,
        val challengeIssued: Boolean?,
    )

    @Serializable
    data class PaymentInstrumentData(
        val network: String? = null,
        val cardholderName: String? = null,
        val first6Digits: Int? = null,
        val last4Digits: Int? = null,
        val accountNumberLast4Digits: Int? = null,
        val expirationMonth: Int? = null,
        val expirationYear: Int? = null,
        val externalPayerInfo: ExternalPayerInfo? = null,
        val klarnaCustomerToken: String? = null,
        val sessionData: SessionData? = null,
        val paymentMethodType: String? = null,
        val binData: BinData? = null,
        val bankName: String? = null,
    )

    @Serializable
    data class ExternalPayerInfo(
        val email: String,
        val externalPayerId: String?,
        val firstName: String?,
        val lastName: String?,
    )

    @Serializable
    data class BinData(
        val network: String? = null,
    )

    @Serializable
    data class SessionData(
        val recurringDescription: String? = null,
        val billingAddress: BillingAddress? = null,
    )

    @Serializable
    data class BillingAddress(
        val email: String,
    )

    companion object {
        fun fromPaymentMethodToken(token: PrimerPaymentMethodTokenData): PrimerPaymentInstrumentTokenRN {
            return PrimerPaymentInstrumentTokenRN(
                token.token,
                token.analyticsId,
                token.tokenType,
                token.paymentInstrumentType,
                token.paymentInstrumentData?.toPaymentInstrumentDataRN(),
            )
        }
    }
}
