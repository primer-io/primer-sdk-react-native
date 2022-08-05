package com.primerioreactnative.huc.events

internal enum class PrimerHeadlessUniversalCheckoutRawDataManagerEvent(val eventName: String) {
  ON_METADATA_CHANGED("onMetadataChange"),
  ON_VALIDATION_CHANGED("onValidation"),
  ON_NATIVE_ERROR("onNativeError"),
}
