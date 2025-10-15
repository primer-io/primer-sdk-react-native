package com.primerioreactnative

import com.facebook.react.BaseReactPackage
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
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
import java.com.primerioreactnative.NativePrimerModule

class ReactNativePackage : ReactPackage {
    private val json = Json { ignoreUnknownKeys = true }

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(
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

class ReactNativeTurboPackage : BaseReactPackage() {

    private val json = Json { ignoreUnknownKeys = true }

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        if (name == DefaultNativePrimerModule.NAME) {
            NativePrimerModule(reactContext, json)
        } else {
            null
        }

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            DefaultNativePrimerModule.NAME to ReactModuleInfo(
                name = DefaultNativePrimerModule.NAME,
                className = DefaultNativePrimerModule.NAME,
                canOverrideExistingModule = false,
                needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = true
            )
        )
    }
}
