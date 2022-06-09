package com.primerioreactnative

import androidx.annotation.Nullable
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.PrimerErrorRN
import com.primerioreactnative.datamodels.PrimerPaymentInstrumentTokenRN
import com.primerioreactnative.datamodels.PrimerSettingsRN
import com.primerioreactnative.huc.assets.AssetsManager
import com.primerioreactnative.huc.assets.AssetsManager.drawableToBitmap
import com.primerioreactnative.huc.assets.AssetsManager.getFile
import com.primerioreactnative.huc.events.PrimerHeadlessUniversalCheckoutEvent
import com.primerioreactnative.huc.extensions.toArgumentsMap
import io.primer.android.completion.ResumeHandler
import io.primer.android.components.PrimerHeadlessUniversalCheckout
import io.primer.android.components.PrimerHeadlessUniversalCheckoutListener
import io.primer.android.components.domain.core.models.PrimerHeadlessUniversalCheckoutPaymentMethod
import io.primer.android.components.ui.assets.ImageType
import io.primer.android.model.dto.*
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class PrimerHeadlessUniversalCheckout(
  private val reactContext: ReactApplicationContext,
  private val json: Json,
) : ReactContextBaseJavaModule(reactContext), PrimerHeadlessUniversalCheckoutListener {

  override fun getName(): String {
    return "PrimerHeadlessUniversalCheckout"
  }

  private var resumeHandler: ResumeHandler? = null
  private var successCallback: Callback? = null

  @ReactMethod
  fun startWithClientToken(
    clientToken: String,
    settingsStr: String?,
    errorCallback: Callback,
    successCallback: Callback
  ) {
    try {
      val settings = json.decodeFromString<PrimerSettingsRN>(settingsStr.orEmpty())
      this.successCallback = successCallback
      PrimerHeadlessUniversalCheckout.current.start(
        reactContext,
        clientToken,
        PrimerConfig(settings = settings.format()),
        this
      )
    } catch (e: Exception) {
      errorCallback.invoke(
        json.encodeToString(
          PrimerErrorRN(
            ErrorTypeRN.InitFailed,
            "failed to initialise PrimerHeadlessUniversalCheckout SDK, error: $e",
          )
        )
      )
    }
  }

  @ReactMethod
  fun resumeWithClientToken(resumeToken: String) {
    this.resumeHandler?.handleNewClientToken(resumeToken)
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
  fun disposeHeadlessCheckout() {
    PrimerHeadlessUniversalCheckout.current.cleanup()
  }

  @ReactMethod
  fun getAssetForPaymentMethodType(
    paymentMethodType: String,
    assetType: String,
    errorCallback: Callback,
    successCallback: Callback
  ) {

    val primerPaymentMethodType = PrimerPaymentMethodType.safeValueOf(paymentMethodType)
    val type = ImageType.values().find { it.name.equals(assetType, ignoreCase = true) }
    when {
      primerPaymentMethodType == PaymentMethodType.UNKNOWN -> {
        errorCallback.invoke(
          json.encodeToString(
            PrimerErrorRN(
              ErrorTypeRN.AssetMissing,
              "Asset for $paymentMethodType does not exist, make sure you don't have any typos."
            )
          )
        )
      }
      type == null -> {
        errorCallback.invoke(
          json.encodeToString(
            PrimerErrorRN(
              ErrorTypeRN.AssetMismatch,
              "You have provided assetType=$assetType, but variable assetType can be 'LOGO' or 'ICON'."
            )
          )
        )
      }
      else -> {
        PrimerHeadlessUniversalCheckout.getAsset(primerPaymentMethodType, type)?.let { resourceId ->
          val file = getFile(reactContext, paymentMethodType)
          AssetsManager.saveBitmapToFile(
            file,
            drawableToBitmap(ContextCompat.getDrawable(reactContext, resourceId)!!),
          )
          successCallback.invoke("file://${file.absolutePath}")
        } ?: run {
          errorCallback.invoke(
            json.encodeToString(
              PrimerErrorRN(
                ErrorTypeRN.AssetMissing,
                "Failed to find $paymentMethodType for $assetType"
              )
            )
          )
        }
      }
    }
  }

  override fun onClientSessionSetupSuccessfully(paymentMethods: List<PrimerHeadlessUniversalCheckoutPaymentMethod>) {
    sendEvent(PrimerHeadlessUniversalCheckoutEvent.CLIENT_SESSION_SETUP_SUCCESS)
    successCallback?.invoke(
      Arguments.fromList(paymentMethods.map { it.paymentMethodType.name })
    )
  }

  override fun onTokenizationPreparation() {
    sendEvent(PrimerHeadlessUniversalCheckoutEvent.TOKENIZATION_PREPARATION_STARTED)
  }

  override fun onTokenizationStarted() {
    sendEvent(PrimerHeadlessUniversalCheckoutEvent.TOKENIZATION_STARTED)
  }

  override fun onPaymentMethodShowed() {
    sendEvent(PrimerHeadlessUniversalCheckoutEvent.PAYMENT_METH0D_SHOWED)
  }

  override fun onTokenizationSuccess(
    paymentMethodToken: PaymentMethodToken,
    resumeHandler: ResumeHandler
  ) {
    this.resumeHandler = resumeHandler

    sendEvent(
      PrimerHeadlessUniversalCheckoutEvent.TOKENIZATION_SUCCESS,
      mapOf(
        "paymentMethodToken" to json.encodeToString(
          PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(
            paymentMethodToken
          )
        )
      ).toArgumentsMap()
    )
  }

  override fun onResumeSuccess(resumeToken: String, resumeHandler: ResumeHandler) {
    this.resumeHandler = resumeHandler

    sendEvent(
      PrimerHeadlessUniversalCheckoutEvent.RESUME,
      mapOf("resumeToken" to resumeToken).toArgumentsMap()
    )

  }

  override fun onError(error: APIError) {
    sendEvent(
      PrimerHeadlessUniversalCheckoutEvent.ERROR,
      mapOf("error" to error.toString()).toArgumentsMap()
    )
  }


  private fun sendEvent(
    event: PrimerHeadlessUniversalCheckoutEvent,
    @Nullable params: WritableMap? = null
  ) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(event.eventName, params)
  }
}
