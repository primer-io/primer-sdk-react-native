package com.primerioreactnative

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.primerioreactnative.components.manager.asset.PrimerRNHeadlessUniversalCheckoutAssetManager
import com.primerioreactnative.components.manager.nativeUi.PrimerRNHeadlessUniversalCheckoutNativeUiManager
import com.primerioreactnative.components.manager.raw.PrimerRNHeadlessUniversalCheckoutRawManager
import com.primerioreactnative.components.manager.vault.PrimerRNHeadlessUniversalCheckoutVaultManager
import com.primerioreactnative.components.manager.redirect.PrimerRNHeadlessUniversalCheckoutBanksComponent
import kotlinx.serialization.json.Json

class ReactNativePackage : ReactPackage {

  private val json = Json { ignoreUnknownKeys = true }

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(
      PrimerRN(reactContext, json),
      PrimerRNHeadlessUniversalCheckout(reactContext, json),
      PrimerRNHeadlessUniversalCheckoutRawManager(reactContext, json),
      PrimerRNHeadlessUniversalCheckoutNativeUiManager(reactContext),
      PrimerRNHeadlessUniversalCheckoutAssetManager(reactContext),
      PrimerRNHeadlessUniversalCheckoutVaultManager(reactContext, json)
      //region Component with redirect components
      PrimerRNHeadlessUniversalCheckoutBanksComponent(reactContext)
      //endregion
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


