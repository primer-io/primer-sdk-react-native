package com.primerioreactnative.components.events

internal enum class PrimerHeadlessUniversalCheckoutComponentEvent(val eventName: String) {
    ON_STEP("onStep"),
    ON_ERROR("onError"),
    ON_IN_VALID("onInvalid"),
    ON_VALID("onValid"),
    ON_VALIDATING("onValidating"),
    ON_VALIDATION_ERROR("onValidationError"),
}
