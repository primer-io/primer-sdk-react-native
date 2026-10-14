package com.primerioreactnative.components.datamodels.manager.raw.otp

import io.primer.android.otp.PrimerOtpData
import kotlinx.serialization.Serializable

@Serializable
internal data class PrimerRNOtpData(
    val otp: String? = null,
) {
    fun toPrimerOtpData() =
        PrimerOtpData(
            otp.orEmpty(),
        )
}
