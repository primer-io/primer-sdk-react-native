package com.primerioreactnative

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.assets.ReactFontManager
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
        PrimerViewUtilsModule::class.java,
    )

    private var fontRegistered = false

    // A custom font is looked up before the system one, so registering once here is enough.
    private fun registerFont(reactContext: ReactApplicationContext) {
        if (fontRegistered) return
        fontRegistered = true
        ReactFontManager.getInstance().addCustomFont(reactContext, INTER_FONT_FAMILY, R.font.primer_inter)
    }

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        registerFont(reactContext)
        return when (name) {
            DefaultNativePrimerModule.NAME -> NativePrimerModule(reactContext, json)
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

            PrimerRNHeadlessUniversalCheckoutStripeAchUserDetailsComponent.NAME ->
                PrimerRNHeadlessUniversalCheckoutStripeAchUserDetailsComponent(
                    reactContext,
                )

            PrimerRNAchMandateManager.NAME -> PrimerRNAchMandateManager(reactContext)
            PrimerRNHeadlessUniversalCheckoutBanksComponent.NAME -> PrimerRNHeadlessUniversalCheckoutBanksComponent(
                reactContext,
            )

            PrimerGooglePayButtonConstantsModule.NAME -> PrimerGooglePayButtonConstantsModule(reactContext)
            PrimerViewUtilsModule.NAME -> PrimerViewUtilsModule(reactContext)
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
        registerFont(reactContext)
        return mutableListOf(
            PrimerKlarnaPaymentViewManager(),
            PrimerGooglePayButtonManager(),
        )
    }

    private companion object {
        const val INTER_FONT_FAMILY = "Inter"
    }
}
