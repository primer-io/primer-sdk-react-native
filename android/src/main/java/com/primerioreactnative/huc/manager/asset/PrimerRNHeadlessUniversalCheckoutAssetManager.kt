package com.primerioreactnative.huc.manager.asset

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.huc.datamodels.manager.asset.PrimerRNPaymentMethodAssets
import com.primerioreactnative.huc.datamodels.manager.asset.toPrimerRNPaymentMethodLogo
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.errorTo
import io.primer.android.ExperimentalPrimerApi
import io.primer.android.components.ui.assets.PrimerAssetManager
import io.primer.android.components.ui.assets.PrimerAssetManagerInterface
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

@ExperimentalPrimerApi
internal class PrimerRNHeadlessUniversalCheckoutAssetManager(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  private val assetManager: PrimerAssetManagerInterface = PrimerAssetManager.newInstance()

  override fun getName() = "RNTPrimerHeadlessUniversalCheckoutAssetsManager"

  @ReactMethod
  fun getPaymentMethodAsset(paymentMethodTypeStr: String, promise: Promise) {
    try {
      val paymentMethodAsset =
        assetManager.getPaymentMethodAsset(reactContext, paymentMethodTypeStr)
      promise.resolve(
        convertJsonToMap(
          JSONObject().apply {
            put(
              "paymentMethodAsset",
              Json.encodeToString(
                paymentMethodAsset.toPrimerRNPaymentMethodLogo(
                  reactContext,
                  paymentMethodTypeStr
                )
              )
            )
          }
        )
      )
    } catch (e: Exception) {
      val exception =
        ErrorTypeRN.AssetMissing errorTo "Failed to find asset of $paymentMethodTypeStr for this session"
      promise.reject(exception.errorId, exception.description)
    }
  }

  @ReactMethod
  fun getPaymentMethodAssets(promise: Promise) {
    val paymentMethodAssets = assetManager.getPaymentMethodAssets(reactContext)
    if (paymentMethodAssets.isEmpty()) {
      val exception =
        ErrorTypeRN.AssetMissing errorTo "Failed to find assets for this session"
      promise.reject(exception.errorId, exception.description)
    }
    promise.resolve(
      convertJsonToMap(
        JSONObject(
          Json.encodeToString(
            PrimerRNPaymentMethodAssets(paymentMethodAssets.map {
              it.toPrimerRNPaymentMethodLogo(
                reactContext,
                it.paymentMethodType
              )
            })
          )
        )
      )
    )
  }
}
