package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerCheckoutModuleRN
import com.primerioreactnative.datamodels.PrimerClientSessionRN
import io.primer.android.components.bridge.clientsession.ComponentsCheckoutModule
import io.primer.android.domain.action.models.PrimerClientSession

internal fun PrimerClientSession.toPrimerClientSessionRN(
    checkoutModules: List<ComponentsCheckoutModule>? = null,
) = PrimerClientSessionRN(
    customerId,
    orderId,
    currencyCode,
    totalAmount,
    lineItems?.map { it.toPrimerLineItemRN() },
    orderDetails?.toPrimerOrderRN(),
    customer?.toPrimerCustomerRN(),
    checkoutModules?.map { PrimerCheckoutModuleRN(it.type, it.options) },
)
