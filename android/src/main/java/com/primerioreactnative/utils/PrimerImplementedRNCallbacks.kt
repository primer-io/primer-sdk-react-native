package com.primerioreactnative.utils

import kotlinx.serialization.Serializable

@Serializable
data class PrimerImplementedRNCallbacks(
  val isClientTokenCallbackImplemented: Boolean? = null,
  val isTokenAddedToVaultImplemented: Boolean? = null,
  val isOnResumeSuccessImplemented: Boolean? = null,
  val isOnResumeErrorImplemented: Boolean? = null,
  val isOnCheckoutDismissedImplemented: Boolean? = null,
  val isCheckoutFailedImplemented: Boolean? = null,
  val isClientSessionActionsImplemented: Boolean? = null
)
