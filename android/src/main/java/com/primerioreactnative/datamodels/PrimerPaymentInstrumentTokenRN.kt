package com.primerioreactnative.datamodels

import io.primer.android.data.tokenization.models.PaymentInstrumentData
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
  data class ThreeDSAuthenticationData (
    val responseCode: String?,
    val reasonCode: String?,
    val reasonText: String?,
    val protocolVersion: String?,
    val challengeIssued: Boolean?,
  )

  companion object {
    fun fromPaymentMethodToken(token: PrimerPaymentMethodTokenData): PrimerPaymentInstrumentTokenRN {
      return PrimerPaymentInstrumentTokenRN(
        token.token,
        token.analyticsId,
        token.tokenType,
        token.paymentInstrumentType,
        token.paymentInstrumentData,
      )
    }
  }
}
