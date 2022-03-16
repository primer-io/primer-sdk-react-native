package com.primerioreactnative.datamodels

import io.primer.android.model.PrimerDebugOptions
import io.primer.android.model.dto.*
import kotlinx.serialization.Serializable

@Serializable
class PrimerSettingsRN(
  val order: OrderRN? = null,
  val business: BusinessRN? = null,
  private val customer: CustomerRN? = null,
  private val options: OptionsRN? = null,
) {
  fun format(): PrimerSettings {
    val order = order?.format() ?: Order()
    val customer = customer?.format() ?: Customer()
    val business = business?.format() ?: Business()
    val options = options?.format() ?: Options()
    return PrimerSettings(order, customer, business, options)
  }
}

@Serializable
data class OrderRN(
  val amount: Int? = null,
  val currency: String? = null,
  val countryCode: String? = null,
  val items: List<OrderItemRN>? = null,
  val shipping: PrimerAddressRN? = null,
) {
  fun format(): Order {
    return Order(
      amount = amount,
      currency = currency,
      countryCode = countryCode?.let { CountryCode.valueOf(it) },

    )
  }
}

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
) {

  fun format(): Business {
    return Business(
      name = name,
      registrationNumber = registrationNumber,
      email = email,
      phone = phone,
      address = address?.format(),
    )
  }
}

@Serializable
data class CustomerRN(
  val id: String? = null,
  val firstName: String? = null,
  val lastName: String? = null,
  val email: String? = null,
  val phone: String? = null,
  val billing: PrimerAddressRN? = null,
) {
  fun format(): Customer {
    return Customer(
      id = id,
      firstName = firstName,
      lastName = lastName,
      email = email,
      homePhone = phone,
      billingAddress = billing?.format(),
    )
  }
}

@Serializable
data class OptionsRN(
  val isResultScreenEnabled: Boolean? = null,
  val isLoadingScreenEnabled: Boolean? = null,
  val isFullScreenEnabled: Boolean? = null,
  val is3DSOnVaultingEnabled: Boolean? = null,
  val locale: String? = null,
  val android: AndroidOptionsRN? = null,
  val is3DSDevelopmentModeEnabled: Boolean = true
) {
  fun format(): Options {
    return Options(
      showUI = isLoadingScreenEnabled ?: true,
      redirectScheme = android?.redirectScheme,
      is3DSOnVaultingEnabled = is3DSOnVaultingEnabled ?: false,
      debugOptions = PrimerDebugOptions(
        is3DSSanityCheckEnabled = is3DSDevelopmentModeEnabled, // false on emulator
      ),
    )
  }
}

@Serializable
data class AndroidOptionsRN(
  val redirectScheme: String? = null,
)

@Serializable
data class PrimerAddressRN(
  val line1: String?,
  val line2: String? = null,
  val postalCode: String?,
  val state: String? = null,
  val city: String?,
  val country: String?,
) {

  fun format(): Address? {
      if (
        line1 == null ||
        postalCode == null ||
        city == null ||
        country == null
      ) {
        return null
      }

      return Address(
        line1 = line1,
        line2 = line2,
        city = city,
        countryCode = CountryCode.valueOf(country),
        postalCode = postalCode,
      )
  }
}
