package com.primerioreactnative.datamodels.extensions.banks

import com.primerioreactnative.datamodels.banks.BanksCollectableDataRN
import io.primer.android.components.manager.banks.composable.BanksCollectableData

internal fun BanksCollectableData.BankId.toBankIdRN() = BanksCollectableDataRN.BankIdRN(id)

internal fun BanksCollectableData.Filter.toFilterRN() = BanksCollectableDataRN.FilterRN(text)
