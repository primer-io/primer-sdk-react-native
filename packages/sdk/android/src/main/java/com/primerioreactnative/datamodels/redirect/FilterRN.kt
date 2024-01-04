package com.primerioreactnative.datamodels.redirect

import kotlinx.serialization.Serializable
import io.primer.android.components.manager.banks.composable.BanksCollectableData

@Serializable
data class FilterRN(val text: String)

fun BanksCollectableData.Filter.toFilterRN() = FilterRN(text)
