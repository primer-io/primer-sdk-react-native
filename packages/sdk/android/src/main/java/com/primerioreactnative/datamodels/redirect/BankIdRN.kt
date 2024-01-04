package com.primerioreactnative.datamodels.redirect

import io.primer.android.components.manager.banks.composable.BanksCollectableData
import kotlinx.serialization.Serializable

@Serializable
data class BankIdRN(val id: String)

fun BanksCollectableData.BankId.toBankIdRN() = BankIdRN(id)
