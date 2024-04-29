package com.primerioreactnative.datamodels.klarna

import kotlinx.serialization.Serializable

@Serializable
internal data class KlarnaPaymentCategoryRN(
    val identifier: String,
    val name: String,
    val descriptiveAssetUrl: String,
    val standardAssetUrl: String
)