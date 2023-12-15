package com.primerioreactnative.components.datamodels.manager.raw.phoneNumber

import io.primer.android.components.domain.core.models.phoneNumber.PrimerPhoneNumberData
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNPhoneNumberData(
  val phoneNumber: String? = null,
) {
  fun toPrimerPhoneNumberData() =
    PrimerPhoneNumberData(
      phoneNumber.orEmpty()
    )
}
