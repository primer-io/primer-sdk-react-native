package com.primerioreactnative.components.datamodels.manager.vault

import com.primerioreactnative.datamodels.PaymentInstrumentData
import com.primerioreactnative.datamodels.ThreeDSAuthenticationData
import com.primerioreactnative.extensions.toPaymentInstrumentDataRN
import com.primerioreactnative.extensions.toThreeDsAuthenticationDataRN
import kotlinx.serialization.Serializable
import io.primer.android.data.tokenization.models.*

@Serializable
data class PrimerRNVaultedPaymentMethod(
  val id: String,
  val analyticsId: String,
  val paymentInstrumentType: String,
  val paymentMethodType: String,
  val paymentInstrumentData: PaymentInstrumentData,
  val threeDSecureAuthentication: ThreeDSAuthenticationData? = null
)

@Serializable
data class PrimerRNVaultedPaymentMethods(
  val paymentMethods: List<PrimerRNVaultedPaymentMethod>
)

internal fun PrimerVaultedPaymentMethod.toPrimerRNVaultedPaymentMethod() =
  PrimerRNVaultedPaymentMethod(
    it.id,
    it.analyticsId,
    it.paymentInstrumentType,
    it.paymentMethodType,
    it.paymentInstrumentData?.toPaymentInstrumentDataRN(),
    it.threeDSecureAuthentication?.toThreeDsAuthenticationDataRN()
  )

