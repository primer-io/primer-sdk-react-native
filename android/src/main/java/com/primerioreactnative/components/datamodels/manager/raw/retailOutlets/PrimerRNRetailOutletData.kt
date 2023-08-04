package com.primerioreactnative.components.datamodels.manager.raw.retailOutlets

import io.primer.android.components.domain.core.models.retailOutlet.PrimerRetailerData
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNRetailOutletData(
  val id: String
) {

  fun toPrimerRetailOutletData() = PrimerRetailerData(id)
}
