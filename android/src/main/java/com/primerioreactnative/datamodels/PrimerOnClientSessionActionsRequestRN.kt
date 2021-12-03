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
                type = "SET_PAYMENT_METHOD",
                paymentMethodType = action.paymentMethodType,
                network = action.network,
              )
            }
            is ClientSessionActionsRequest.UnsetPaymentMethod -> {
              Action(
                type = "UNSET_PAYMENT_METHOD",
              )
            }
          }
        }
      )
    }
  }
}
