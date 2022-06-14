package com.primerioreactnative

import androidx.annotation.Nullable
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.primerioreactnative.datamodels.*
import com.primerioreactnative.huc.assets.AssetsManager
import com.primerioreactnative.huc.assets.AssetsManager.drawableToBitmap
import com.primerioreactnative.huc.assets.AssetsManager.getFile
import com.primerioreactnative.huc.events.PrimerHeadlessUniversalCheckoutEvent
import com.primerioreactnative.huc.extensions.toArgumentsMap
import com.primerioreactnative.utils.Keys
import com.primerioreactnative.utils.errorTo
import io.primer.android.completion.ResumeHandler
import io.primer.android.components.PrimerHeadlessUniversalCheckout
import io.primer.android.components.PrimerHeadlessUniversalCheckoutListener
import io.primer.android.components.domain.core.models.PrimerHeadlessUniversalCheckoutPaymentMethod
import io.primer.android.components.ui.assets.ImageType
import io.primer.android.model.dto.*
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

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
      val settings = if (settingsStr.isNullOrBlank()) PrimerSettingsRN() else
        json.decodeFromString(settingsStr.orEmpty())
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
          ErrorTypeRN.InitFailed errorTo
            "failed to initialise PrimerHeadlessUniversalCheckout SDK, error: $e",
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
            ErrorTypeRN.AssetMissing errorTo
              "Asset for $paymentMethodType does not exist, make sure you don't have any typos."
          )
        )
      }
      type == null -> {
        errorCallback.invoke(
          json.encodeToString(
            ErrorTypeRN.AssetMismatch errorTo
              "You have provided assetType=$assetType, but variable assetType can be 'LOGO' or 'ICON'."
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
              ErrorTypeRN.AssetMissing errorTo
                "Failed to find $paymentMethodType for $assetType"
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
        Keys.PAYMENT_METHOD_TOKEN to json.encodeToString(
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
      mapOf(Keys.RESUME_TOKEN to resumeToken).toArgumentsMap()
    )
  }

  override fun onError(error: APIError) {
    sendEvent(
      PrimerHeadlessUniversalCheckoutEvent.ERROR,
      mapOf(
        Keys.ERROR to json.encodeToString(
          ErrorTypeRN.CheckoutFlowFailed errorTo
            error.description
        )
      ).toArgumentsMap()
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
