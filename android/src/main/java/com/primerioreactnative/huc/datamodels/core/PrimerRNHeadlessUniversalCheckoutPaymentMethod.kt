package com.primerioreactnative.huc.datamodels.core

import io.primer.android.PrimerSessionIntent
import io.primer.android.components.domain.core.models.PrimerHeadlessUniversalCheckoutPaymentMethod
import io.primer.android.components.domain.core.models.PrimerPaymentMethodManagerCategory
import kotlinx.serialization.Serializable

@Serializable
data class PrimerRNAvailablePaymentMethods(
  val availablePaymentMethods: List<PrimerRNHeadlessUniversalCheckoutPaymentMethod>
)

@Serializable
data class PrimerRNHeadlessUniversalCheckoutPaymentMethod(
  val paymentMethodType: String,
  val supportedPrimerSessionIntents: List<PrimerSessionIntent>,
  val paymentMethodManagerCategories: List<PrimerPaymentMethodManagerCategory>,
)

internal fun PrimerHeadlessUniversalCheckoutPaymentMethod.toPrimerRNHeadlessUniversalCheckoutPaymentMethod() =
  PrimerRNHeadlessUniversalCheckoutPaymentMethod(
    paymentMethodType,
    supportedPrimerSessionIntents,
    paymentMethodManagerCategories
  )
