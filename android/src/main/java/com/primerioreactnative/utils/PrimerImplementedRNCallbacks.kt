package com.primerioreactnative.utils

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class PrimerImplementedRNCallbacks(
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
  @SerialName("onDismiss")
  val isOnDismissImplemented: Boolean? = null,
  @SerialName("onTokenizeSuccess")
  val isOnTokenizeSuccessImplemented: Boolean? = null,
  @SerialName("onResumeSuccess")
  val isOnResumeSuccessImplemented: Boolean? = null,
  @SerialName("onResumePending")
  val isOnResumePendingImplemented: Boolean? = null,
  @SerialName("onAdditionalInfoReceived")
  val isOnAdditionalInfoReceived: Boolean? = null
)
