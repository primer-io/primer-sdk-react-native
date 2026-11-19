package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerCheckoutModuleRN
import com.primerioreactnative.datamodels.PrimerClientSessionPaymentMethodNetworkRN
import com.primerioreactnative.datamodels.PrimerClientSessionPaymentMethodOptionRN
import com.primerioreactnative.datamodels.PrimerClientSessionRN
import com.primerioreactnative.datamodels.PrimerClientSessionSurchargeRN
import com.primerioreactnative.datamodels.PrimerFeeRN
import io.primer.android.components.bridge.clientsession.ComponentsCheckoutModule
import io.primer.android.components.bridge.clientsession.ComponentsNetworkOption
import io.primer.android.components.bridge.clientsession.ComponentsPaymentMethodOption
import io.primer.android.domain.action.models.PrimerClientSession

internal fun PrimerClientSession.toPrimerClientSessionRN(
    checkoutModules: List<ComponentsCheckoutModule>? = null,
    paymentMethodOptions: List<ComponentsPaymentMethodOption>? = null,
) = PrimerClientSessionRN(
    customerId,
    orderId,
    currencyCode,
    totalAmount,
    lineItems?.map { it.toPrimerLineItemRN() },
    orderDetails?.toPrimerOrderRN(),
    customer?.toPrimerCustomerRN(),
    checkoutModules?.map { PrimerCheckoutModuleRN(it.type, it.options) },
    paymentMethodOptions?.associate { it.type to it.toPrimerClientSessionPaymentMethodOptionRN() },
    fees?.map { PrimerFeeRN(it.type, it.amount) },
)

private fun ComponentsPaymentMethodOption.toPrimerClientSessionPaymentMethodOptionRN() =
    PrimerClientSessionPaymentMethodOptionRN(
        surcharge = surcharge?.let(::PrimerClientSessionSurchargeRN),
        networks = networks.associate { it.type to it.toPrimerClientSessionPaymentMethodNetworkRN() },
    )

private fun ComponentsNetworkOption.toPrimerClientSessionPaymentMethodNetworkRN() =
    PrimerClientSessionPaymentMethodNetworkRN(surcharge?.let(::PrimerClientSessionSurchargeRN))
