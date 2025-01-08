package com.primerioreactnative.datamodels.banks

import com.primerioreactnative.datamodels.NamedComponentValidatableData
import kotlinx.serialization.Serializable

@Serializable
internal sealed interface BanksCollectableDataRN : NamedComponentValidatableData {
  @Serializable
  data class FilterRN(val text: String) : BanksCollectableDataRN {
    override val validatableDataName: String = "bankListFilter"
  }

  @Serializable
  data class BankIdRN(val id: String) : BanksCollectableDataRN {
    override val validatableDataName: String = "bankId"
  }
}
