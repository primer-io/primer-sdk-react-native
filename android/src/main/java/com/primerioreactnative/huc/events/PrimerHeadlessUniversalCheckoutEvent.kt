package com.primerioreactnative.huc.events

internal enum class PrimerHeadlessUniversalCheckoutEvent(val eventName: String) {
  ON_HUC_CLIENT_SESSION_SETUP("onHUCClientSessionSetup"),
  ON_HUC_PREPARE_START("onHUCPrepareStart"),
  ON_HUC_PAYMENT_METHOD_PRESENT("onHUCPaymentMethodShow"),
  ON_HUC_TOKENIZE_START("onHUCTokenizeStart"),
  ON_CHECKOUT_COMPLETE("onCheckoutComplete"),
  ON_BEFORE_CLIENT_SESSION_UPDATE("onBeforeClientSessionUpdate"),
  ON_CLIENT_SESSION_UPDATE("onClientSessionUpdate"),
  ON_BEFORE_PAYMENT_CREATE("onBeforePaymentCreate"),
  ON_TOKENIZE_SUCCESS("onTokenizeSuccess"),
  ON_RESUME_SUCCESS("onResumeSuccess"),
  ON_ERROR("onError"),
}
