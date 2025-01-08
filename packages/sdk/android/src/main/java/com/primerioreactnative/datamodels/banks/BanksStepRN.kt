package com.primerioreactnative.datamodels.banks

import com.primerioreactnative.datamodels.NamedComponentStep
import com.primerioreactnative.datamodels.PrimerIssuingBankRN
import kotlinx.serialization.Serializable

@Serializable
internal sealed interface BanksStepRN : NamedComponentStep {
  @Serializable
  class LoadingRN : BanksStepRN {
    override val stepName: String = "banksLoading"
  }

  @Serializable
  data class BanksRetrievedRN(
    val banks: List<PrimerIssuingBankRN>,
  ) : BanksStepRN {
    override val stepName: String = "banksRetrieved"
  }
}
