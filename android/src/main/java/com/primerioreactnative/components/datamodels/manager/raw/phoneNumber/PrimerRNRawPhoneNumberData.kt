package com.primerioreactnative.components.datamodels.manager.raw.phoneNumber

import io.primer.android.components.domain.core.models.phoneNumber.PrimerRawPhoneNumberData
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNRawPhoneNumberData(
  val phoneNumber: String? = null,
) {
  fun toPrimerRawPhoneNumberData() =
    PrimerRawPhoneNumberData(
      phoneNumber.orEmpty()
    )
}
