package com.primerioreactnative.datamodels.extensions.banks

import io.primer.android.components.manager.banks.composable.BanksCollectableData
import com.primerioreactnative.datamodels.banks.BanksCollectableDataRN

internal fun BanksCollectableData.BankId.toBankIdRN() = BanksCollectableDataRN.BankIdRN(id)

internal fun BanksCollectableData.Filter.toFilterRN() = BanksCollectableDataRN.FilterRN(text)