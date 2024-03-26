package com.primerioreactnative.extensions.klarna

import com.primerioreactnative.datamodels.klarna.KlarnaPaymentCategoryRN
import io.primer.android.components.domain.payments.paymentMethods.nativeUi.klarna.models.KlarnaPaymentCategory

internal fun KlarnaPaymentCategory.toKlarnaPaymentCategoryRN() =
    KlarnaPaymentCategoryRN(
        identifier = identifier,
        name = name,
        descriptiveAssetUrl = descriptiveAssetUrl,
        standardAssetUrl = standardAssetUrl
    )
