package com.primerioreactnative.huc.events

internal enum class PrimerHeadlessUniversalCheckoutEvent(val eventName: String) {
  ON_AVAILABLE_PAYMENT_METHODS_LOADED("onAvailablePaymentMethodsLoad"),
  ON_HUC_PREPARE_START("onHUCPrepareStart"),
  ON_HUC_PAYMENT_METHOD_SHOW("onHUCPaymentMethodShow"),
  ON_HUC_TOKENIZE_START("onHUCTokenizeStart"),
  ON_CHECKOUT_COMPLETE("onCheckoutComplete"),
  ON_CHECKOUT_PENDING("onCheckoutPending"),
  ON_BEFORE_CLIENT_SESSION_UPDATE("onBeforeClientSessionUpdate"),
  ON_CLIENT_SESSION_UPDATE("onClientSessionUpdate"),
  ON_BEFORE_PAYMENT_CREATE("onBeforePaymentCreate"),
  ON_TOKENIZE_SUCCESS("onTokenizeSuccess"),
  ON_CHECKOUT_SUCCESS("onCheckoutResume"),
  ON_CHECKOUT_ADDITIONAL_INFO("onCheckoutAdditionalInfo"),
  ON_ERROR("onError"),
}
