package com.primerioreactnative.components.datamodels.manager.vault

import com.primerioreactnative.datamodels.PrimerPaymentInstrumentTokenRN.PaymentInstrumentData
import com.primerioreactnative.datamodels.PrimerPaymentInstrumentTokenRN.ThreeDSAuthenticationData
import com.primerioreactnative.extensions.toPaymentInstrumentDataRN
import com.primerioreactnative.extensions.toThreeDsAuthenticationDataRN
import io.primer.android.domain.tokenization.models.PrimerVaultedPaymentMethod
import kotlinx.serialization.Serializable

@Serializable
data class PrimerRNVaultedPaymentMethod(
  val id: String,
  val analyticsId: String,
  val paymentInstrumentType: String,
  val paymentMethodType: String,
  val paymentInstrumentData: PaymentInstrumentData?,
  val threeDSecureAuthentication: ThreeDSAuthenticationData? = null
)

@Serializable
data class PrimerRNVaultedPaymentMethods(
  val paymentMethods: List<PrimerRNVaultedPaymentMethod>
)

internal fun PrimerVaultedPaymentMethod.toPrimerRNVaultedPaymentMethod() =
  PrimerRNVaultedPaymentMethod(
    id,
    analyticsId,
    paymentInstrumentType,
    paymentMethodType,
    paymentInstrumentData.toPaymentInstrumentDataRN(),
    threeDSecureAuthentication?.toThreeDsAuthenticationDataRN()
  )

