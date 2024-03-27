package com.primerioreactnative.datamodels

import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerIssuingBankRN(
    val id: String,
    val name: String,
    val disabled: Boolean,
    val iconUrl: String
)
