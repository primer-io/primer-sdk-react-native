package com.primerioreactnative.datamodels.extensions.banks

import io.primer.android.components.manager.banks.composable.BanksCollectableData
import io.primer.android.components.manager.banks.composable.BanksStep
import com.primerioreactnative.datamodels.banks.BanksStepRN
import com.primerioreactnative.extensions.toPrimerIssuingBankRN


internal fun BanksStep.Loading.toLoadingRN() = BanksStepRN.LoadingRN()

internal fun BanksStep.BanksRetrieved.toBanksRetrievedRN() = BanksStepRN.BanksRetrievedRN(banks = banks.map { it.toPrimerIssuingBankRN() })