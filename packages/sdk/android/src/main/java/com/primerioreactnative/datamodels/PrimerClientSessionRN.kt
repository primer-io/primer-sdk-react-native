package com.primerioreactnative.datamodels

import io.primer.android.data.configuration.models.CountryCode
import io.primer.android.domain.action.models.*
import kotlinx.serialization.Serializable

@Serializable
data class PrimerClientSessionRN(
  val customerId: String?,
  val orderId: String?,
  val currencyCode: String?,
  val totalAmount: Int?,
  val lineItems: List<PrimerLineItemRN>?,
  val orderDetails: PrimerOrderRN?,
  val customer: PrimerCustomerRN?,
)

@Serializable
data class PrimerCustomerRN(
  val emailAddress: String?,
  val mobileNumber: String?,
  val firstName: String?,
  val lastName: String?,
  val billingAddress: PrimerAddressRN?,
  val shippingAddress: PrimerAddressRN?,
)

@Serializable
data class PrimerOrderRN(
  val countryCode: CountryCode?,
)

@Serializable
data class PrimerLineItemRN(
  val itemId: String?,
  val itemDescription: String?,
  val amount: Int?,
  val discountAmount: Int?,
  val quantity: Int?,
  val taxCode: String?,
  val taxAmount: Int?
)

@Serializable
data class PrimerAddressRN(
  val firstName: String? = null,
  val lastName: String? = null,
  val addressLine1: String? = null,
  val addressLine2: String? = null,
  val postalCode: String? = null,
  val city: String? = null,
  val state: String? = null,
  val countryCode: CountryCode? = null,
)
