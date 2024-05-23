package com.primerioreactnative.datamodels

import kotlinx.serialization.Serializable

@Serializable
sealed class PrimerCheckoutAdditionalInfoRN {
  abstract val additionalInfoName: String
}

@Serializable
data class MultibancoCheckoutAdditionalInfoRN(
  val expiresAt: String,
  val reference: String,
  val entity: String,
) : PrimerCheckoutAdditionalInfoRN() {
  override val additionalInfoName: String = "MultibancoCheckoutAdditionalInfo"
}

sealed class PrimerCheckoutQRCodeInfoRN : PrimerCheckoutAdditionalInfoRN()

@Serializable
data class PromptPayCheckoutAdditionalInfoRN(
  val expiresAt: String,
  val qrCodeUrl: String?,
  val qrCodeBase64: String?,
) : PrimerCheckoutQRCodeInfoRN() {
  override val additionalInfoName: String = "PromptPayCheckoutAdditionalInfo"
}

sealed class PrimerCheckoutVoucherInfoRN : PrimerCheckoutAdditionalInfoRN()

@Serializable
data class XenditCheckoutVoucherAdditionalInfoRN(
  val expiresAt: String,
  val couponCode: String,
  val retailerName: String?,
) : PrimerCheckoutVoucherInfoRN() {
  override val additionalInfoName: String = "XenditCheckoutVoucherAdditionalInfo"
}

@Serializable
class AchAdditionalInfoDisplayMandateRN : PrimerCheckoutVoucherInfoRN() {
  override val additionalInfoName: String = "DisplayStripeAchMandateAdditionalInfo"
}
