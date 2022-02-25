package com.primerioreactnative

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import io.primer.android.components.manager.PrimerCardManager


class ReactNativePackage : ReactPackage {

  private val cardManager by lazy { PrimerCardManager.newInstance() }

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(
      PrimerRN(reactContext, cardManager)
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


