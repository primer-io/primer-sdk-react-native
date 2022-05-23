package com.primerioreactnative.utils

import kotlinx.serialization.Serializable

@Serializable
data class PrimerImplementedRNCallbacks(
  val isOnCheckoutCompletedImplemented: Boolean? = null,
  val isOnBeforePaymentCreatedImplemented: Boolean? = null,
  val isOnBeforeClientSessionUpdatedImplemented: Boolean? = null,
  val isOnClientSessionUpdated: Boolean? = null,
  val isOnTokenizeSuccessImplemented: Boolean? = null,
  val isOnResumeSuccessImplemented: Boolean? = null,
  val isOnCheckoutDismissedImplemented: Boolean? = null,
  val isCheckoutFailedImplemented: Boolean? = null,
)
