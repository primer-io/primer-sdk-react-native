package com.primerioreactnative.datamodels

internal enum class PrimerEvents(val eventName: String) {

  ON_CHECKOUT_COMPLETE("onCheckoutComplete"),
  ON_BEFORE_CLIENT_SESSION_UPDATE("onBeforeClientSessionUpdate"),
  ON_CLIENT_SESSION_UPDATE("onClientSessionUpdate"),
  ON_BEFORE_PAYMENT_CREATE("onBeforePaymentCreate"),
  ON_DISMISS("onDismiss"),
  ON_TOKENIZE_SUCCESS("onTokenizeSuccess"),
  ON_RESUME_SUCCESS("onResumeSuccess"),
  ON_ERROR("onError"),
}
