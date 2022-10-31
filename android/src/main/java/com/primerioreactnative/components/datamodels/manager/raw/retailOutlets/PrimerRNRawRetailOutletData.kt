package com.primerioreactnative.components.datamodels.manager.raw.retailOutlets

import io.primer.android.components.domain.core.models.retailOutlet.PrimerRawRetailerData
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNRawRetailOutletData(
  val id: String
) {

  fun toPrimerRawRetailOutletData() = PrimerRawRetailerData(id)
}
