package com.primerioreactnative.components.manager.asset

import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.primerioreactnative.components.assets.AssetsManager
import com.primerioreactnative.components.assets.AssetsManager.drawableToBitmap
import com.primerioreactnative.components.assets.CardNetworkImageFileProvider.getFileForCardNetworkAsset
import com.primerioreactnative.components.datamodels.manager.asset.PrimerCardNetworkAsset
import com.primerioreactnative.components.datamodels.manager.asset.PrimerRNPaymentMethodAssets
import com.primerioreactnative.components.datamodels.manager.asset.toPrimerRNPaymentMethodLogo
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.errorTo
import io.primer.android.ExperimentalPrimerApi
import io.primer.android.components.ui.assets.PrimerAssetsManager
import io.primer.android.ui.CardNetwork
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

@ExperimentalPrimerApi
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
      else -> try {
        PrimerAssetsManager.getCardNetworkImage(cardNetwork).let { resourceId ->
          val file = getFileForCardNetworkAsset(reactContext, cardNetworkStr)
          AssetsManager.saveBitmapToFile(
            file,
            drawableToBitmap(ContextCompat.getDrawable(reactContext, resourceId)!!),
          )
          promise.resolve(
            convertJsonToMap(
              JSONObject(
                Json.encodeToString(
                  PrimerCardNetworkAsset("file://${file.absolutePath}")
                )
              )
            )
          )
        }
      } catch (e: Exception) {
        promise.reject(ErrorTypeRN.NativeBridgeFailed.errorId, e.message, e)
      }
    }
  }

  @ReactMethod
  fun getPaymentMethodAsset(paymentMethodTypeStr: String, promise: Promise) {
    try {
      val paymentMethodAsset =
        PrimerAssetsManager.getPaymentMethodAsset(reactContext, paymentMethodTypeStr)
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
        ErrorTypeRN.NativeBridgeFailed errorTo "Failed to find asset of $paymentMethodTypeStr for this session."
      promise.reject(exception.errorId, exception.description)
    }
  }

  @ReactMethod
  fun getPaymentMethodAssets(promise: Promise) {
    val paymentMethodAssets =
      PrimerAssetsManager.getPaymentMethodAssets(reactContext)
    if (paymentMethodAssets.isEmpty()) {
      val exception =
        ErrorTypeRN.NativeBridgeFailed errorTo "Failed to find assets for this session"
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
