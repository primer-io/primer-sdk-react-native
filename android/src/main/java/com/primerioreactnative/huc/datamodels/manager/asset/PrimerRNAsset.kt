package com.primerioreactnative.huc.datamodels.manager.asset

import android.graphics.drawable.Drawable
import com.facebook.react.bridge.ReactApplicationContext
import com.primerioreactnative.huc.assets.AssetsManager
import com.primerioreactnative.huc.assets.AssetsManager.drawableToBitmap
import com.primerioreactnative.huc.assets.AssetsManager.getFile
import com.primerioreactnative.huc.assets.ImageColorType
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
        ImageColorType.COLORED,
        it
      )
    },
    paymentMethodLogo.light?.let {
      getFileUrl(
        reactContext,
        paymentMethodType,
        ImageColorType.LIGHT,
        it
      )
    },
    paymentMethodLogo.dark?.let {
      getFileUrl(
        reactContext,
        paymentMethodType,
        ImageColorType.DARK,
        it
      )
    }
  ),
  PrimerRNPaymentMethodBackgroundColor(
    paymentMethodBackgroundColor.colored,
    paymentMethodBackgroundColor.light,
    paymentMethodBackgroundColor.dark
  )
)


private fun getFileUrl(
  reactContext: ReactApplicationContext,
  paymentMethodType: String,
  imageColorType: ImageColorType,
  drawable: Drawable,
): String {
  val file = getFile(reactContext, paymentMethodType, imageColorType)
  AssetsManager.saveBitmapToFile(
    file,
    drawableToBitmap(drawable),
  )
  return "file://${file.absolutePath}"
}



