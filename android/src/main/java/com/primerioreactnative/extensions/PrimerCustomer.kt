package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerCustomerRN
import io.primer.android.domain.action.models.PrimerCustomer

internal fun PrimerCustomer.toPrimerCustomerRN() =
    PrimerCustomerRN(
        emailAddress,
        mobileNumber,
        firstName,
        lastName,
        billingAddress?.toPrimerAddressRN(),
        shippingAddress?.toPrimerAddressRN(),
    )
