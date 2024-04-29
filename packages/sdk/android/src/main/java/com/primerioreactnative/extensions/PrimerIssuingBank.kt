package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerIssuingBankRN
import io.primer.android.domain.rpc.banks.models.IssuingBank

internal fun IssuingBank.toPrimerIssuingBankRN() =
  PrimerIssuingBankRN(id, name, disabled, iconUrl)
