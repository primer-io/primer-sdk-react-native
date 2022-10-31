package com.primerioreactnative.components.datamodels.manager.asset

import android.graphics.drawable.Drawable
import com.facebook.react.bridge.ReactApplicationContext
import com.primerioreactnative.components.assets.AssetsManager
import com.primerioreactnative.components.assets.AssetsManager.drawableToBitmap
import com.primerioreactnative.components.assets.PaymentMethodAssetFileProvider.getFileForPaymentMethodAsset
import io.primer.android.components.ui.assets.PrimerPaymentMethodAsset
import kotlinx.serialization.Serializable

@Serializable
data class PrimerRNPaymentMethodAssets(
  val paymentMethodAssets: List<PrimerRNPaymentMethodAsset>
)

@Serializable
data class PrimerRNPaymentMethodAsset(
  val paymentMethodType: String,
  val paymentMethodLogo: PrimerRNPaymentMethodLogo,
  val paymentMethodBackgroundColor: PrimerRNPaymentMethodBackgroundColor
)

@Serializable
data class PrimerRNPaymentMethodLogo(
  val colored: String?,
  val light: String?,
  val dark: String?
)

@Serializable
data class PrimerRNPaymentMethodBackgroundColor(
  val colored: String?,
  val light: String?,
  val dark: String?
)

@Serializable
data class PrimerCardNetworkAsset(
  val cardNetworkImageURL: String
)

fun PrimerPaymentMethodAsset.toPrimerRNPaymentMethodLogo(
  reactContext: ReactApplicationContext,
  paymentMethodType: String,
) = PrimerRNPaymentMethodAsset(
  paymentMethodType,
  PrimerRNPaymentMethodLogo(
    paymentMethodLogo.colored?.let {
      getFileUrl(
        reactContext,
        paymentMethodType,
        AssetsManager.ImageColorType.COLORED,
        it
      )
    },
    paymentMethodLogo.light?.let {
      getFileUrl(
        reactContext,
        paymentMethodType,
        AssetsManager.ImageColorType.LIGHT,
        it
      )
    },
    paymentMethodLogo.dark?.let {
      getFileUrl(
        reactContext,
        paymentMethodType,
        AssetsManager.ImageColorType.DARK,
        it
      )
    }
  ),
  PrimerRNPaymentMethodBackgroundColor(
    paymentMethodBackgroundColor.colored?.let {
      String.format("#%06X", (0xFFFFFF and it))
    },
    paymentMethodBackgroundColor.light?.let {
      String.format("#%06X", (0xFFFFFF and it))
    },
    paymentMethodBackgroundColor.dark?.let {
      String.format("#%06X", (0xFFFFFF and it))
    }
  )
)


private fun getFileUrl(
  reactContext: ReactApplicationContext,
  paymentMethodType: String,
  imageColorType: AssetsManager.ImageColorType,
  drawable: Drawable,
): String {
  val file = getFileForPaymentMethodAsset(reactContext, paymentMethodType, imageColorType)
  AssetsManager.saveBitmapToFile(
    file,
    drawableToBitmap(drawable),
  )
  return "file://${file.absolutePath}"
}



