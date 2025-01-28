package com.primerioreactnative.components.datamodels.manager.raw.retailOutlets

import io.primer.android.RetailOutletsList
import kotlinx.serialization.Serializable

@Serializable
internal data class RNRetailOutletsList(
    val result: List<RNRetailOutlet>,
)

@Serializable
internal data class RNRetailOutlet(
    val id: String,
    val name: String,
    val disabled: Boolean,
    val iconUrl: String,
)

internal fun RetailOutletsList.toRNRetailOutletsList() =
    RNRetailOutletsList(
        result.map {
            RNRetailOutlet(
                it.id,
                it.name,
                it.disabled,
                it.iconUrl,
            )
        },
    )
