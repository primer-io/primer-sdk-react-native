package com.primerioreactnative

import androidx.annotation.Nullable
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import io.primer.android.completion.ResumeHandler
import io.primer.android.components.PrimerHeadlessUniversalCheckoutListener
import io.primer.android.components.domain.core.models.PrimerHeadlessUniversalCheckoutPaymentMethod
import io.primer.android.model.dto.APIError
import io.primer.android.model.dto.PaymentMethodToken
import io.primer.android.model.dto.PrimerPaymentMethodType
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json


@Serializable
sealed class HeadlessCheckoutRequest(val kind: String)

@Serializable
private class OnClientSessionSetupSuccessfullyRequest(
  val paymentMethodTypes: List<PrimerPaymentMethodType>,
) : HeadlessCheckoutRequest("OnClientSessionSetupSuccessfully")

@Serializable
private data class OnErrorRequest(
  val error: APIError,
) : HeadlessCheckoutRequest("OnError")

@Serializable
private class OnPaymentMethodPresentedRequest : HeadlessCheckoutRequest("OnPaymentMethodPresented")

@Serializable
private class OnPreparationStartedRequest : HeadlessCheckoutRequest("OnPreparationStarted")

@Serializable
private data class OnResumeSuccessRequest(
  val token: String,
) : HeadlessCheckoutRequest("OnResumeSuccess")

@Serializable
private class OnTokenizationStartedRequest : HeadlessCheckoutRequest("OnTokenizationStarted")

@Serializable
private data class OnTokenizationSuccessRequest(
  val token: String,
) : HeadlessCheckoutRequest("OnTokenizationSuccess")

@Serializable
sealed class HeadlessCheckoutResumeRequest(
  val kind: String,
)

@Serializable
data class HeadlessCheckoutResumeWithErrorRequest(
  val errorDescription: String,
) : HeadlessCheckoutResumeRequest("Error")

@Serializable
data class HeadlessCheckoutResumeWithClientTokenRequest(
  val clientToken: String,
) : HeadlessCheckoutResumeRequest("ClientToken")

@Serializable
class HeadlessCheckoutResumeWithNullRequest : HeadlessCheckoutResumeRequest("Null")

class HeadlessCheckoutListener(
  private val reactContext: ReactContext,
  private val json: Json,
) : PrimerHeadlessUniversalCheckoutListener {

  private var callback: Callback? = null
  private var resumeHandler: ResumeHandler? = null

  fun setCallback(callback: Callback) {
    this.callback = callback
  }

  fun resume(clientToken: String?, errorDescription: String?) {
    if (errorDescription != null) {
      resumeHandler?.handleError(Error(errorDescription))
    } else if (clientToken != null) {
      resumeHandler?.handleNewClientToken(clientToken)
    } else {
      resumeHandler?.handleSuccess()
    }
  }

  private fun emit(request: HeadlessCheckoutRequest) {
    try {
      val encoded = json.encodeToString(request)
      callback?.invoke(encoded)
    } catch (e: Exception) {
      val error = APIError("Failed to encode JSON string: ${request.kind} $e")
      val errorRequest = OnErrorRequest(error)
      val encoded = json.encodeToString(errorRequest)
      callback?.invoke(encoded)
    }
//    callback = null
  }

  private fun sendEvent(
    reactContext: ReactContext,
    eventName: String,
    @Nullable params: WritableMap? = null
  ) {
    reactContext
      .getJSModule(RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  override fun onClientSessionSetupSuccessfully(paymentMethods: List<PrimerHeadlessUniversalCheckoutPaymentMethod>) {
    val request =
      OnClientSessionSetupSuccessfullyRequest(paymentMethods.map { it.paymentMethodType })

    sendEvent(
      reactContext,
      PrimerHeadlessUniversalCheckoutEvents.clientSessionDidSetUpSuccessfully.name,
    )
    emit(request)
  }

  // present error
  override fun onError(error: APIError) {
    val request = OnErrorRequest(error)
    emit(request)
  }

  override fun onPaymentMethodShowed() {
    sendEvent(
      reactContext,
      PrimerHeadlessUniversalCheckoutEvents.paymentMethodPresented.name,
    )
  }

  // present loading
  override fun onTokenizationPreparation() {
    val request = OnPreparationStartedRequest()
    emit(request)
  }

  override fun onResumeSuccess(resumeToken: String, resumeHandler: ResumeHandler) {
    this.resumeHandler = resumeHandler
    val request = OnResumeSuccessRequest(resumeToken)
    emit(request)
  }


  override fun onTokenizationStarted() {
    val request = OnTokenizationStartedRequest()
    emit(request)
  }

  override fun onTokenizationSuccess(
    paymentMethodToken: PaymentMethodToken,
    resumeHandler: ResumeHandler
  ) {
    this.resumeHandler = resumeHandler
    val request = OnTokenizationSuccessRequest(paymentMethodToken.token)
    emit(request)
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
