package com.primerioreactnative.utils

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class PrimerHeadlessUniversalCheckoutImplementedRNCallbacks(
  @SerialName("onCheckoutComplete")
  val isOnCheckoutCompleteImplemented: Boolean? = null,
  @SerialName("onBeforeClientSessionUpdate")
  val isOnBeforeClientSessionUpdateImplemented: Boolean? = null,
  @SerialName("onClientSessionUpdate")
  val isOnClientSessionUpdateImplemented: Boolean? = null,
  @SerialName("onBeforePaymentCreate")
  val isOnBeforePaymentCreateImplemented: Boolean? = null,
  @SerialName("onError")
  val isOnErrorImplemented: Boolean? = null,
  @SerialName("onTokenizeSuccess")
  val isOnTokenizeSuccessImplemented: Boolean? = null,
  @SerialName("onCheckoutResume")
  val isOnCheckoutResumeImplemented: Boolean? = null,
  @SerialName("onCheckoutPending")
  val isOnCheckoutPendingImplemented: Boolean? = null,
  @SerialName("onCheckoutAdditionalInfo")
  val isOnCheckoutAdditionalInfoImplemented: Boolean? = null,
  @SerialName("onTokenizationStart")
  val isOnTokenizationStartImplemented: Boolean? = null,
  @SerialName("onPreparationStart")
  val isOnPreparationStartImplemented: Boolean? = null,
  @SerialName("onAvailablePaymentMethodsLoad")
  val isOnAvailablePaymentMethodsLoadImplemented: Boolean? = null,
  @SerialName("onPaymentMethodShow")
  val isOnPaymentMethodShowImplemented: Boolean? = null,
)
