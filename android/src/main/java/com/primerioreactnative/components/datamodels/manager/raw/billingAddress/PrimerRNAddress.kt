package com.primerioreactnative.components.datamodels.manager.raw.billingAddress

import io.primer.android.configuration.data.model.CountryCode
import io.primer.android.domain.action.models.PrimerAddress
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNAddress(
    val firstName: String? = null,
    val lastName: String? = null,
    val addressLine1: String? = null,
    val addressLine2: String? = null,
    val postalCode: String? = null,
    val city: String? = null,
    val state: String? = null,
    val countryCode: String? = null,
) {
    fun toPrimerAddress(): PrimerAddress =
        PrimerAddress(
            firstName = firstName,
            lastName = lastName,
            addressLine1 = addressLine1,
            addressLine2 = addressLine2,
            postalCode = postalCode,
            city = city,
            state = state,
            countryCode = countryCode?.let { CountryCode.valueOf(it) },
        )
}
