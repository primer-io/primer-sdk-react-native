package com.primerioreactnative

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

class RNTPrimerHeadlessUniversalCheckoutCardFormUIManager(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "PrimerHeadlessUniversalCheckoutCardFormUIManager"
  }
}
