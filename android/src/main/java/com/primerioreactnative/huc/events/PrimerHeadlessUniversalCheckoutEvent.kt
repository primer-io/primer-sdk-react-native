package com.primerioreactnative.huc.events

internal enum class PrimerHeadlessUniversalCheckoutEvent(val eventName: String) {
  CLIENT_SESSION_SETUP_SUCCESS("clientSessionDidSetUpSuccessfully"),
  TOKENIZATION_PREPARATION_STARTED("preparationStarted"),
  PAYMENT_METH0D_SHOWED("paymentMethodPresented"),
  TOKENIZATION_STARTED("tokenizationStarted"),
  TOKENIZATION_SUCCESS("tokenizationSucceeded"),
  RESUME("resume"),
  ERROR("error");
}
