package com.primerioreactnative

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.module.annotations.ReactModuleList
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

@ReactModuleList(
    nativeModules = [
        NativePrimerModule::class,
    ],
)
class PrimerSdkPackage : BaseReactPackage() {

    private val json = Json { ignoreUnknownKeys = true }

    // Old Architecture modules
    private val oldArchModules: Array<Class<out NativeModule>> = arrayOf(
        PrimerRNHeadlessUniversalCheckout::class.java,
        PrimerRNHeadlessUniversalCheckoutRawManager::class.java,
        PrimerRNHeadlessUniversalCheckoutNativeUiManager::class.java,
        PrimerRNHeadlessUniversalCheckoutAssetManager::class.java,
        PrimerRNHeadlessUniversalCheckoutVaultManager::class.java,
        PrimerRNHeadlessUniversalCheckoutKlarnaComponent::class.java,
        PrimerRNHeadlessUniversalCheckoutStripeAchUserDetailsComponent::class.java,
        PrimerRNAchMandateManager::class.java,
        PrimerRNHeadlessUniversalCheckoutBanksComponent::class.java,
        PrimerGooglePayButtonConstantsModule::class.java,
    )

    // New Architecture modules
    private val newArchModules: Array<Class<out NativeModule>> = arrayOf(
        NativePrimerModule::class.java,
    )

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        if (name == DefaultNativePrimerModule.NAME) {
            NativePrimerModule(reactContext, json)
        } else {
            when (name) {
                PrimerRNHeadlessUniversalCheckout.NAME -> PrimerRNHeadlessUniversalCheckout(reactContext, json)
                PrimerRNHeadlessUniversalCheckoutRawManager.NAME -> PrimerRNHeadlessUniversalCheckoutRawManager(
                    reactContext,
                    json,
                )

                PrimerRNHeadlessUniversalCheckoutNativeUiManager.NAME -> PrimerRNHeadlessUniversalCheckoutNativeUiManager(
                    reactContext,
                )

                PrimerRNHeadlessUniversalCheckoutAssetManager.NAME -> PrimerRNHeadlessUniversalCheckoutAssetManager(
                    reactContext,
                )
                PrimerRNHeadlessUniversalCheckoutVaultManager.NAME -> PrimerRNHeadlessUniversalCheckoutVaultManager(
                    reactContext,
                    json,
                )

                PrimerRNHeadlessUniversalCheckoutKlarnaComponent.NAME -> PrimerRNHeadlessUniversalCheckoutKlarnaComponent(
                    reactContext,
                )

                PrimerRNHeadlessUniversalCheckoutStripeAchUserDetailsComponent.NAME -> PrimerRNHeadlessUniversalCheckoutStripeAchUserDetailsComponent(
                    reactContext,
                )

                PrimerRNAchMandateManager.NAME -> PrimerRNAchMandateManager(reactContext)
                PrimerRNHeadlessUniversalCheckoutBanksComponent.NAME -> PrimerRNHeadlessUniversalCheckoutBanksComponent(
                    reactContext,
                )

                PrimerGooglePayButtonConstantsModule.NAME -> PrimerGooglePayButtonConstantsModule(reactContext)
                else -> null
            }
        }

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        val moduleList = newArchModules + oldArchModules

        val reactModuleInfoMap: MutableMap<String, ReactModuleInfo> = HashMap()
        for (moduleClass in moduleList) {
            val reactModule = moduleClass.getAnnotation(ReactModule::class.java) ?: continue
            reactModuleInfoMap[reactModule.name] = ReactModuleInfo(
                reactModule.name,
                moduleClass.name,
                reactModule.canOverrideExistingModule,
                reactModule.needsEagerInit,
                reactModule.isCxxModule,
                newArchModules.any {
                    it.name == moduleClass.name
                }, // isTurboModule
            )
        }
        reactModuleInfoMap
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return mutableListOf(
            PrimerKlarnaPaymentViewManager(),
            PrimerGooglePayButtonManager(),
        )
    }
}
