package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerLineItemRN
import io.primer.android.domain.action.models.PrimerLineItem

internal fun PrimerLineItem.toPrimerLineItemRN() =
    PrimerLineItemRN(
        itemId,
        itemDescription,
        amount,
        discountAmount,
        quantity,
        taxCode,
        taxAmount,
    )
