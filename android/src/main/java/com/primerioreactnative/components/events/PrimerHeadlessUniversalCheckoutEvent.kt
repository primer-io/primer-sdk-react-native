package com.primerioreactnative.components.events

internal enum class PrimerHeadlessUniversalCheckoutEvent(val eventName: String) {
  ON_AVAILABLE_PAYMENT_METHODS_LOAD("onAvailablePaymentMethodsLoad"),
  ON_PREPARE_START("onPreparationStart"),
  ON_PAYMENT_METHOD_SHOW("onPaymentMethodShow"),
  ON_TOKENIZE_START("onTokenizationStart"),
  ON_CHECKOUT_COMPLETE("onCheckoutComplete"),
  ON_CHECKOUT_PENDING("onCheckoutPending"),
  ON_BEFORE_CLIENT_SESSION_UPDATE("onBeforeClientSessionUpdate"),
  ON_CLIENT_SESSION_UPDATE("onClientSessionUpdate"),
  ON_BEFORE_PAYMENT_CREATE("onBeforePaymentCreate"),
  ON_TOKENIZE_SUCCESS("onTokenizationSuccess"),
  ON_CHECKOUT_SUCCESS("onCheckoutResume"),
  ON_CHECKOUT_ADDITIONAL_INFO("onCheckoutAdditionalInfo"),
  ON_ERROR("onError"),
}
