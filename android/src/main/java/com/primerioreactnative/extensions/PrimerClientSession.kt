package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerClientSessionRN
import io.primer.android.domain.action.models.PrimerClientSession

internal fun PrimerClientSession.toPrimerClientSessionRN() =
  PrimerClientSessionRN(
    customerId,
    orderId,
    currencyCode,
    totalAmount,
    lineItems?.map { it.toPrimerLineItemRN() },
    orderDetails?.toPrimerOrderRN(),
    customer?.toPrimerCustomerRN()
  )
