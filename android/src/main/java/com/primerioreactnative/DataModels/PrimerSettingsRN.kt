package com.primerioreactnative.DataModels

import kotlinx.serialization.Serializable

@Serializable
class PrimerSettingsRN(
  val order: OrderRN? = null,
  val business: BusinessRN? = null,
  val customer: CustomerRN? = null,
  val options: OptionsRN? = null,
)

@Serializable
data class OrderRN(
  val amount: Int? = null,
  val currency: String? = null,
  val countryCode: String? = null,
  val items: List<OrderItemRN>? = null,
)

@Serializable
data class OrderItemRN(
  val name: String,
  val unitAmount: Int?,
  val quantity: Int,
  val isPending: Boolean?,
)

@Serializable
data class BusinessRN(
  val name: String? = null,
  val address: PrimerAddressRN? = null,
)

@Serializable
data class CustomerRN(
  val firstName: String? = null,
  val lastName: String? = null,
  val email: String? = null,
  val shipping: PrimerAddressRN? = null,
  val billing: PrimerAddressRN? = null,
)

@Serializable
data class OptionsRN(
  val hasDisabledSuccessScreen: Boolean? = null,
  val isInitialLoadingHidden: Boolean? = null,
  val locale: String? = null,
  val androidRedirectScheme: String? = null,
)
