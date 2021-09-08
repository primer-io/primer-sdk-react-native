package com.primerioreactnative.datamodels

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
  val shipping: PrimerAddressRN? = null,
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
  val registrationNumber: String? = null,
  val email: String? = null,
  val phone: String? = null,
  val address: PrimerAddressRN? = null,
)

@Serializable
data class CustomerRN(
  val id: String? = null,
  val firstName: String? = null,
  val lastName: String? = null,
  val email: String? = null,
  val phone: String? = null,
  val billing: PrimerAddressRN? = null,
)

@Serializable
data class OptionsRN(
  val isResultScreenEnabled: Boolean? = null,
  val isLoadingScreenEnabled: Boolean? = null,
  val isFullScreenEnabled: Boolean? = null,
  val locale: String? = null,
  val android: AndroidOptionsRN? = null,
)

@Serializable
data class AndroidOptionsRN(
  val redirectScheme: String? = null,
)

@Serializable
data class PrimerAddressRN(
  val line1: String,
  val line2: String,
  val postalCode: String,
  val state: String?,
  val city: String,
  val country: String,
)
