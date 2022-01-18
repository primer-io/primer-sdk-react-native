package com.primerioreactnative.datamodels

import io.primer.android.data.action.models.ClientSessionActionsRequest
import kotlinx.serialization.Serializable

@Serializable
data class PrimerOnClientSessionActionsRequestRN(
  val actions: List<Action>,
) {

  @Serializable
  data class Action(
    val type: String,
    val paymentMethodType: String? = null,
    val network: String? = null,
    val params: Params? = null,
  )

  @Serializable
  data class Params(
    val billingAddress: Map<String, String?>
  )

  companion object {
    fun build(
      request: ClientSessionActionsRequest,
    ): PrimerOnClientSessionActionsRequestRN {
      return PrimerOnClientSessionActionsRequestRN(
        actions = request.actions.map { action ->
          when (action) {
            is ClientSessionActionsRequest.SetPaymentMethod -> {
              Action(
                type = "SELECT_PAYMENT_METHOD",
                paymentMethodType = action.paymentMethodType,
                network = action.network,
              )
            }
            is ClientSessionActionsRequest.UnsetPaymentMethod -> {
              Action(
                type = "UNSELECT_PAYMENT_METHOD",
              )
            }
            is ClientSessionActionsRequest.SetBillingAddress -> {
              Action(
                type = "SET_BILLING_ADDRESS",
                params = Params(
                  billingAddress = mapOf(
                    "firstName" to action.firstName,
                    "lastName" to action.lastName,
                    "addressLine1" to action.addressLine1,
                    "addressLine2" to action.addressLine2,
                    "city" to action.city,
                    "postalCode" to action.postalCode,
                    "state" to action.state,
                    "countryCode" to action.countryCode
                  )
                )
              )
            }
          }
        }
      )
    }
  }
}
