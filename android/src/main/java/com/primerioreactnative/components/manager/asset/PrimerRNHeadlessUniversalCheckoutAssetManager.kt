package com.primerioreactnative.components.manager.asset

import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.primerioreactnative.components.assets.AssetsManager
import com.primerioreactnative.components.assets.AssetsManager.drawableToBitmap
import com.primerioreactnative.components.assets.CardNetworkImageFileProvider.getFileForCardNetworkAsset
import com.primerioreactnative.components.datamodels.manager.asset.PrimerCardNetworkAsset
import com.primerioreactnative.components.datamodels.manager.asset.PrimerRNPaymentMethodAssetWrapper
import com.primerioreactnative.components.datamodels.manager.asset.PrimerRNPaymentMethodAssets
import com.primerioreactnative.components.datamodels.manager.asset.PrimerRNPaymentMethodResourceWrapper
import com.primerioreactnative.components.datamodels.manager.asset.PrimerRNPaymentMethodResources
import com.primerioreactnative.components.datamodels.manager.asset.toPrimerRNPaymentMethodAsset
import com.primerioreactnative.components.datamodels.manager.asset.toPrimerRNPaymentMethodNativeView
import com.primerioreactnative.components.manager.googlePay.PrimerGooglePayButtonManager
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.utils.errorTo
import com.primerioreactnative.utils.toWritableMap
import io.primer.android.components.SdkUninitializedException
import io.primer.android.components.ui.assets.PrimerHeadlessUniversalCheckoutAssetsManager
import io.primer.android.components.ui.assets.PrimerPaymentMethodAsset
import io.primer.android.components.ui.assets.PrimerPaymentMethodNativeView
import io.primer.android.configuration.data.model.CardNetwork
import io.primer.android.core.ExperimentalPrimerApi
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

@ExperimentalPrimerApi
@ReactModule(name = PrimerRNHeadlessUniversalCheckoutAssetManager.NAME)
internal class PrimerRNHeadlessUniversalCheckoutAssetManager(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "RNTPrimerHeadlessUniversalCheckoutAssetsManager"

    @ReactMethod
    fun getCardNetworkImage(
        cardNetworkStr: String,
        promise: Promise,
    ) {
        val cardNetwork =
            CardNetwork.Type.values().find { it.name.equals(cardNetworkStr, ignoreCase = true) }
        when (cardNetwork) {
            null -> {
                val exception =
                    ErrorTypeRN.NativeBridgeFailed errorTo "Failed to find asset of $cardNetworkStr."
                promise.reject(exception.errorId, exception.description)
            }

            else ->
                try {
                    PrimerHeadlessUniversalCheckoutAssetsManager.getCardNetworkImage(cardNetwork)
                        .let { resourceId ->
                            val file = getFileForCardNetworkAsset(reactContext, cardNetworkStr)
                            AssetsManager.saveBitmapToFile(
                                file,
                                drawableToBitmap(ContextCompat.getDrawable(reactContext, resourceId)!!),
                            )
                            promise.resolve(
                                JSONObject(
                                    Json.encodeToString(
                                        PrimerCardNetworkAsset("file://${file.absolutePath}"),
                                    ),
                                ).toWritableMap(),
                            )
                        }
                } catch (e: SdkUninitializedException) {
                    promise.reject(ErrorTypeRN.UnitializedSdkSession.errorId, e.message, e)
                } catch (e: Exception) {
                    promise.reject(ErrorTypeRN.NativeBridgeFailed.errorId, e.message, e)
                }
        }
    }

    @Suppress("SwallowedException")
    @ReactMethod
    fun getPaymentMethodAsset(
        paymentMethodTypeStr: String,
        promise: Promise,
    ) {
        try {
            val paymentMethodAsset =
                PrimerHeadlessUniversalCheckoutAssetsManager.getPaymentMethodAsset(
                    reactContext,
                    paymentMethodTypeStr,
                )
            promise.resolve(
                JSONObject(
                    Json.encodeToString(
                        PrimerRNPaymentMethodAssetWrapper(
                            paymentMethodAsset.toPrimerRNPaymentMethodAsset(
                                reactContext,
                                paymentMethodTypeStr,
                            ),
                        ),
                    ),
                ).toWritableMap(),
            )
        } catch (e: SdkUninitializedException) {
            return promise.reject(ErrorTypeRN.UnitializedSdkSession.errorId, e.message, e)
        } catch (e: Exception) {
            val exception =
                ErrorTypeRN.NativeBridgeFailed errorTo "Failed to find asset of $paymentMethodTypeStr for this session."
            return promise.reject(exception.errorId, exception.description)
        }
    }

    @ReactMethod
    fun getPaymentMethodAssets(promise: Promise) {
        try {
            val paymentMethodAssets =
                PrimerHeadlessUniversalCheckoutAssetsManager.getPaymentMethodAssets(reactContext)
            if (paymentMethodAssets.isEmpty()) {
                val exception =
                    ErrorTypeRN.NativeBridgeFailed errorTo "Failed to find assets for this session"
                promise.reject(exception.errorId, exception.description)
            }
            promise.resolve(
                JSONObject(
                    Json.encodeToString(
                        PrimerRNPaymentMethodAssets(
                            paymentMethodAssets.map {
                                it.toPrimerRNPaymentMethodAsset(
                                    reactContext,
                                    it.paymentMethodType,
                                )
                            },
                        ),
                    ),
                ).toWritableMap(),
            )
        } catch (e: SdkUninitializedException) {
            promise.reject(ErrorTypeRN.UnitializedSdkSession.errorId, e.message, e)
        }
    }

    @ReactMethod
    fun getPaymentMethodResources(promise: Promise) {
        try {
            val paymentMethodResources =
                PrimerHeadlessUniversalCheckoutAssetsManager.getPaymentMethodResources(reactContext)
            if (paymentMethodResources.isEmpty()) {
                val exception =
                    ErrorTypeRN.NativeBridgeFailed errorTo "Failed to find resources for this session"
                promise.reject(exception.errorId, exception.description)
            }
            promise.resolve(
                JSONObject(
                    Json.encodeToString(
                        PrimerRNPaymentMethodResources(
                            paymentMethodResources.map {
                                when (it) {
                                    is PrimerPaymentMethodAsset -> {
                                        it.toPrimerRNPaymentMethodAsset(
                                            reactContext = reactContext,
                                            paymentMethodType = it.paymentMethodType,
                                        )
                                    }

                                    is PrimerPaymentMethodNativeView -> {
                                        PrimerGooglePayButtonManager.updatePrimerGooglePayButtonCreator { context ->
                                            it.createView(context)
                                        }

                                        it.toPrimerRNPaymentMethodNativeView(
                                            paymentMethodType = it.paymentMethodType,
                                        )
                                    }
                                }
                            },
                        ),
                    ),
                ).toWritableMap(),
            )
        } catch (e: SdkUninitializedException) {
            promise.reject(ErrorTypeRN.UnitializedSdkSession.errorId, e.message, e)
        }
    }

    @ReactMethod
    fun getPaymentMethodResource(
        paymentMethodTypeStr: String,
        promise: Promise,
    ) {
        try {
            val paymentMethodResource =
                PrimerHeadlessUniversalCheckoutAssetsManager.getPaymentMethodResource(
                    reactContext,
                    paymentMethodTypeStr,
                )
            promise.resolve(
                JSONObject(
                    Json.encodeToString(
                        PrimerRNPaymentMethodResourceWrapper(
                            when (paymentMethodResource) {
                                is PrimerPaymentMethodAsset -> {
                                    paymentMethodResource.toPrimerRNPaymentMethodAsset(
                                        reactContext = reactContext,
                                        paymentMethodType = paymentMethodResource.paymentMethodType,
                                    )
                                }

                                is PrimerPaymentMethodNativeView -> {
                                    PrimerGooglePayButtonManager.updatePrimerGooglePayButtonCreator { context ->
                                        paymentMethodResource.createView(context)
                                    }

                                    paymentMethodResource.toPrimerRNPaymentMethodNativeView(
                                        paymentMethodType = paymentMethodResource.paymentMethodType,
                                    )
                                }
                            },
                        ),
                    ),
                ).toWritableMap(),
            )
        } catch (e: SdkUninitializedException) {
            promise.reject(ErrorTypeRN.UnitializedSdkSession.errorId, e.message, e)
        }
    }

    companion object {
        const val NAME = "RNTPrimerHeadlessUniversalCheckoutAssetsManager"
    }
}
