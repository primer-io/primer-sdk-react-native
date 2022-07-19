package com.primerioreactnative

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.primerioreactnative.huc.input.card.PrimerCardNumberEditTextManager
import com.primerioreactnative.huc.input.card.PrimerCardholderNameEditTextManager
import com.primerioreactnative.huc.input.card.PrimerCvvEditTextManager
import com.primerioreactnative.huc.input.card.PrimerExpiryEditTextManager
import io.primer.android.ExperimentalPrimerApi
import kotlinx.serialization.json.Json

@OptIn(ExperimentalPrimerApi::class)
class ReactNativePackage : ReactPackage {

  private val json = Json { ignoreUnknownKeys = true }

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(
      PrimerRN(reactContext, json),
      PrimerRNHeadlessUniversalCheckout(reactContext, json),
      NativeHeadlessCheckoutCardComponentsManager(reactContext)
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


