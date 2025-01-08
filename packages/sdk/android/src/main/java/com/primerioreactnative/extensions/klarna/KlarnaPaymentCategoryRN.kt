package com.primerioreactnative.extensions.klarna

import com.primerioreactnative.datamodels.klarna.KlarnaPaymentCategoryRN
import io.primer.android.klarna.implementation.session.domain.models.KlarnaPaymentCategory

internal fun KlarnaPaymentCategoryRN.toKlarnaPaymentCategory() =
  KlarnaPaymentCategory(
    identifier = identifier,
    name = name,
    descriptiveAssetUrl = descriptiveAssetUrl,
    standardAssetUrl = standardAssetUrl,
  )
