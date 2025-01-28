package com.primerioreactnative.datamodels.extensions.banks

import com.primerioreactnative.datamodels.banks.BanksStepRN
import com.primerioreactnative.extensions.toPrimerIssuingBankRN
import io.primer.android.components.manager.banks.composable.BanksStep

internal fun BanksStep.Loading.toLoadingRN() = BanksStepRN.LoadingRN()

internal fun BanksStep.BanksRetrieved.toBanksRetrievedRN() =
    BanksStepRN.BanksRetrievedRN(
        banks =
        banks.map {
            it.toPrimerIssuingBankRN()
        },
    )
