package com.primerioreactnative

import android.graphics.Bitmap
import android.graphics.Bitmap.CompressFormat
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import androidx.annotation.Nullable
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.primer.android.completion.ResumeHandler
import io.primer.android.components.PrimerHeadlessUniversalCheckout
import io.primer.android.components.PrimerHeadlessUniversalCheckoutListener
import io.primer.android.components.domain.core.models.PrimerHeadlessUniversalCheckoutPaymentMethod
import io.primer.android.components.ui.assets.Brand
import io.primer.android.components.ui.assets.ImageType
import io.primer.android.model.dto.PaymentMethodToken
import io.primer.android.model.dto.PaymentMethodType
import io.primer.android.model.dto.PrimerConfig
import io.primer.android.model.dto.PrimerPaymentMethodType
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.IOException


class PrimerHeadlessUniversalCheckout(
  private val reactContext: ReactApplicationContext,
  private val json: Json
) :
  ReactContextBaseJavaModule(reactContext), PrimerHeadlessUniversalCheckoutListener {
  override fun getName(): String {
    return "PrimerHeadlessUniversalCheckout"
  }

  @ReactMethod
  fun startWithClientToken(
    clientToken: String,
    settingsStr: String?,
    errorCallback: Callback,
    successCallback: Callback
  ) {
    PrimerHeadlessUniversalCheckout.current.start(
      reactContext,
      clientToken,
      PrimerConfig(),
      object : PrimerHeadlessUniversalCheckoutListener {
        override fun onClientSessionSetupSuccessfully(paymentMethods: List<PrimerHeadlessUniversalCheckoutPaymentMethod>) {
          super.onClientSessionSetupSuccessfully(paymentMethods)
          successCallback.invoke(
            Arguments.fromList(paymentMethods.map { it.paymentMethodType.name })
          )
        }

        override fun onTokenizationPreparation() {
          sendEvent(reactContext, PrimerHeadlessUniversalCheckoutEvents.preparationStarted.name)
        }

        override fun onTokenizationStarted() {
          sendEvent(reactContext, PrimerHeadlessUniversalCheckoutEvents.tokenizationStarted.name)
        }

        override fun onTokenizationSuccess(
          paymentMethodToken: PaymentMethodToken,
          resumeHandler: ResumeHandler
        ) {
          sendEvent(
            reactContext, PrimerHeadlessUniversalCheckoutEvents.tokenizationSucceeded.name,
            Arguments.createMap()
              .apply {
                putString("paymentMethodToken", JSONObject().apply {
                  put("token", paymentMethodToken.token)
                }.toString())
              }
          )
        }
      })
  }


  @ReactMethod
  fun showPaymentMethod(paymentMethodType: String) {
    val primerPaymentMethodType = PrimerPaymentMethodType.safeValueOf(paymentMethodType)
    PrimerHeadlessUniversalCheckout.current.showPaymentMethod(
      reactContext,
      primerPaymentMethodType
    )
  }

  @ReactMethod
  fun getAssetFor(
    paymentMethodType: String,
    assetType: String,
    errorCallback: Callback,
    successCallback: Callback
  ) {

    val resourceId =
      PrimerHeadlessUniversalCheckout.getAsset(reactContext, Brand.GOOGLE_PAY, ImageType.ICON)
    val file = getFile(paymentMethodType)
    saveBitmapToFile(
      getFile(paymentMethodType),
      drawableToBitmap(ContextCompat.getDrawable(reactContext, resourceId!!)!!)!!,
      CompressFormat.PNG,
      100
    )
    successCallback.invoke("file://" + file.absolutePath)
  }

  fun drawableToBitmap(drawable: Drawable): Bitmap? {
    if (drawable is BitmapDrawable) {
      return drawable.bitmap
    }
    var width = drawable.intrinsicWidth
    width = if (width > 0) width else 1
    var height = drawable.intrinsicHeight
    height = if (height > 0) height else 1
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight())
    drawable.draw(canvas)
    return bitmap
  }

  fun saveBitmapToFile(
    dir: File?, bm: Bitmap,
    format: CompressFormat?, quality: Int
  ): Boolean {
    var fos: FileOutputStream? = null
    try {
      fos = FileOutputStream(dir)
      bm.compress(format, quality, fos)
      fos.close()
      return true
    } catch (e: IOException) {
      if (fos != null) {
        try {
          fos.close()
        } catch (e1: IOException) {
          e1.printStackTrace()
        }
      }
    }
    return false
  }

  fun getFile(path: String): File {
    val directory = File(reactContext.filesDir, "abc")
    if (!directory.exists()) directory.mkdirs()
    val file = File(
      reactContext.filesDir,
      "abc" + File.pathSeparator + path
    )
    if (!file.exists()) file.createNewFile()
    return file
  }

  private fun sendEvent(
    reactContext: ReactContext,
    eventName: String,
    @Nullable params: WritableMap? = null
  ) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  enum class PrimerHeadlessUniversalCheckoutEvents {
    clientSessionDidSetUpSuccessfully,
    preparationStarted,
    paymentMethodPresented,
    tokenizationStarted,
    tokenizationSucceeded,
    resume,
    error
  }
}
