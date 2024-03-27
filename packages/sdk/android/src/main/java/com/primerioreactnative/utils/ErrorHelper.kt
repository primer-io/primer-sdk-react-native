package com.primerioreactnative.utils

import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.PrimerErrorRN

infix fun ErrorTypeRN.errorTo(message: String) = PrimerErrorRN(
  errorId = errorId,
  description = message
)
