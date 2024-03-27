package com.primerioreactnative.datamodels.banks

import kotlinx.serialization.Serializable
import com.primerioreactnative.datamodels.NamedComponentStep
import com.primerioreactnative.datamodels.PrimerIssuingBankRN

@Serializable
internal sealed interface BanksStepRN : NamedComponentStep {
    @Serializable
    class LoadingRN : BanksStepRN {
        override val stepName: String = "banksLoading"
    }

    @Serializable
    data class BanksRetrievedRN(
        val banks: List<PrimerIssuingBankRN>
    ) : BanksStepRN {
        override val stepName: String = "banksRetrieved"
    }
}