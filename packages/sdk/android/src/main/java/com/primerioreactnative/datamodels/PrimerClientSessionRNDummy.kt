package com.primerioreactnative.datamodels

import io.primer.android.configuration.data.model.CountryCode
import kotlinx.serialization.Serializable

@Serializable
data class PrimerClientSessionRNDummy(
    val customerId: String?,
    val orderId: String?,
    val currencyCode: String?,
    val totalAmount: Int?,
    val lineItems: List<PrimerLineItemRN>?,
    val orderDetails: PrimerOrderRN?,
    val customer: PrimerCustomerRN?,
)
