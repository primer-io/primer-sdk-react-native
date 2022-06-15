package com.primerioreactnative

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import kotlinx.serialization.json.Json

class ReactNativePackage : ReactPackage {

  private val json = Json { ignoreUnknownKeys = true }

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(
      PrimerRN(reactContext, json),
      PrimerRNHeadlessUniversalCheckout(reactContext, json)
    )
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return mutableListOf(
      PrimerCardNumberEditTextManager(),
      PrimerCardholderNameEditTextManager(),
      PrimerExpiryEditTextManager(),
      PrimerCvvEditTextManager(),
    )
  }
}


