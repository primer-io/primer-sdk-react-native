package com.primerioreactnative.components.datamodels.manager.asset

import android.graphics.drawable.Drawable
import com.facebook.react.bridge.ReactApplicationContext
import com.primerioreactnative.components.assets.AssetsManager
import com.primerioreactnative.components.assets.AssetsManager.drawableToBitmap
import com.primerioreactnative.components.assets.PaymentMethodAssetFileProvider.getFileForPaymentMethodAsset
import io.primer.android.components.ui.assets.PrimerPaymentMethodAsset
import io.primer.android.components.ui.assets.PrimerPaymentMethodNativeView
import kotlinx.serialization.Serializable

private const val WHITE_COLOR = 0xFFFFFF
private const val COLOR_FORMAT = "#%06X"

@Serializable
sealed interface PrimerRNPaymentMethodResource {
  val paymentMethodType: String
  val paymentMethodName: String

  @Serializable
  data class PrimerRNPaymentMethodAsset(
    override val paymentMethodType: String,
    override val paymentMethodName: String,
    val paymentMethodLogo: PrimerRNPaymentMethodLogo,
    val paymentMethodBackgroundColor: PrimerRNPaymentMethodBackgroundColor,
  ) : PrimerRNPaymentMethodResource

  @Serializable
  data class PrimerRNPaymentMethodNativeView(
    override val paymentMethodType: String,
    override val paymentMethodName: String,
    val nativeViewName: String,
  ) : PrimerRNPaymentMethodResource
}

@Serializable
data class PrimerRNPaymentMethodAssets(
  val paymentMethodAssets: List<PrimerRNPaymentMethodResource.PrimerRNPaymentMethodAsset>,
)

@Serializable
data class PrimerRNPaymentMethodResources(
  val paymentMethodResources: List<PrimerRNPaymentMethodResource>,
)

@Serializable
data class PrimerRNPaymentMethodAssetWrapper(
  val paymentMethodAsset: PrimerRNPaymentMethodResource.PrimerRNPaymentMethodAsset,
)

@Serializable
data class PrimerRNPaymentMethodResourceWrapper(
  val paymentMethodResource: PrimerRNPaymentMethodResource,
)

@Serializable
data class PrimerRNPaymentMethodLogo(
  val colored: String?,
  val light: String?,
  val dark: String?,
)

@Serializable
data class PrimerRNPaymentMethodBackgroundColor(
  val colored: String?,
  val light: String?,
  val dark: String?,
)

@Serializable
data class PrimerCardNetworkAsset(
  val cardNetworkImageURL: String,
)

fun PrimerPaymentMethodAsset.toPrimerRNPaymentMethodAsset(
  reactContext: ReactApplicationContext,
  paymentMethodType: String,
) = PrimerRNPaymentMethodResource.PrimerRNPaymentMethodAsset(
  paymentMethodType,
  paymentMethodName,
  PrimerRNPaymentMethodLogo(
    paymentMethodLogo.colored?.let {
      getFileUrl(
        reactContext,
        paymentMethodType,
        AssetsManager.ImageColorType.COLORED,
        it,
      )
    },
    paymentMethodLogo.light?.let {
      getFileUrl(
        reactContext,
        paymentMethodType,
        AssetsManager.ImageColorType.LIGHT,
        it,
      )
    },
    paymentMethodLogo.dark?.let {
      getFileUrl(
        reactContext,
        paymentMethodType,
        AssetsManager.ImageColorType.DARK,
        it,
      )
    },
  ),
  PrimerRNPaymentMethodBackgroundColor(
    paymentMethodBackgroundColor.colored?.let {
      String.format(COLOR_FORMAT, (WHITE_COLOR and it))
    },
    paymentMethodBackgroundColor.light?.let {
      String.format(COLOR_FORMAT, (WHITE_COLOR and it))
    },
    paymentMethodBackgroundColor.dark?.let {
      String.format(COLOR_FORMAT, (WHITE_COLOR and it))
    },
  ),
)

fun PrimerPaymentMethodNativeView.toPrimerRNPaymentMethodNativeView(paymentMethodType: String) =
  PrimerRNPaymentMethodResource.PrimerRNPaymentMethodNativeView(
    paymentMethodType = paymentMethodType,
    paymentMethodName = paymentMethodName,
    nativeViewName =
    when (paymentMethodType) {
      "GOOGLE_PAY" -> "PrimerGooglePayButton"
      else -> error("Native view for '$paymentMethodType'is not supported")
    },
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
