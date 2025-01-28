package com.primerioreactnative

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.primerioreactnative.components.manager.ach.PrimerRNAchMandateManager
import com.primerioreactnative.components.manager.ach.PrimerRNHeadlessUniversalCheckoutStripeAchUserDetailsComponent
import com.primerioreactnative.components.manager.asset.PrimerRNHeadlessUniversalCheckoutAssetManager
import com.primerioreactnative.components.manager.banks.PrimerRNHeadlessUniversalCheckoutBanksComponent
import com.primerioreactnative.components.manager.googlePay.PrimerGooglePayButtonConstantsModule
import com.primerioreactnative.components.manager.googlePay.PrimerGooglePayButtonManager
import com.primerioreactnative.components.manager.klarna.PrimerKlarnaPaymentViewManager
import com.primerioreactnative.components.manager.klarna.PrimerRNHeadlessUniversalCheckoutKlarnaComponent
import com.primerioreactnative.components.manager.nativeUi.PrimerRNHeadlessUniversalCheckoutNativeUiManager
import com.primerioreactnative.components.manager.raw.PrimerRNHeadlessUniversalCheckoutRawManager
import com.primerioreactnative.components.manager.vault.PrimerRNHeadlessUniversalCheckoutVaultManager
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
      PrimerRNHeadlessUniversalCheckoutVaultManager(reactContext, json),
      PrimerRNHeadlessUniversalCheckoutKlarnaComponent(reactContext),
      PrimerRNHeadlessUniversalCheckoutStripeAchUserDetailsComponent(reactContext),
      PrimerRNAchMandateManager(reactContext),
      // region Component with redirect components
      PrimerRNHeadlessUniversalCheckoutBanksComponent(reactContext),
      // endregion
      // region Google Pay Helpers
      PrimerGooglePayButtonConstantsModule(reactContext),
      // endregion
    )
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return mutableListOf(
      PrimerKlarnaPaymentViewManager(),
      PrimerGooglePayButtonManager(),
    )
  }
}
