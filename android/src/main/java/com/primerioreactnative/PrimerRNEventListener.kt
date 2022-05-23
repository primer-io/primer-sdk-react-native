package com.primerioreactnative

import android.util.Log
import com.primerioreactnative.datamodels.*
import com.primerioreactnative.utils.PrimerImplementedRNCallbacks
import com.primerioreactnative.utils.errorTo
import io.primer.android.PrimerCheckoutListener
import io.primer.android.completion.PrimerErrorDecisionHandler
import io.primer.android.completion.PrimerPaymentCreationDecisionHandler
import io.primer.android.completion.PrimerResumeDecisionHandler
import io.primer.android.domain.PrimerCheckoutData
import io.primer.android.domain.error.models.PrimerError
import io.primer.android.domain.tokenization.models.PrimerPaymentMethodData
import io.primer.android.domain.tokenization.models.PrimerPaymentMethodTokenData
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

class PrimerRNEventListener : PrimerCheckoutListener {

  private var clientTokenCallback: ((String?, PrimerErrorRN?) -> Unit)? = null
  private var onTokenizeSuccess: ((String?, PrimerErrorRN?) -> Unit)? = null
  private var onResumeSuccess: ((String?, PrimerErrorRN?) -> Unit)? = null
  private var implementedRNCallbacks: PrimerImplementedRNCallbacks? = null

  private var resumeHandler: PrimerResumeDecisionHandler? = null

  var sendEvent: ((eventName: String, paramsJson: JSONObject?) -> Unit)? = null
  var sendError: ((error: PrimerErrorRN) -> Unit)? = null


  override fun onCheckoutCompleted(checkoutData: PrimerCheckoutData) {
    println(checkoutData)
  }

  override fun onBeforePaymentCreated(
    paymentMethodData: PrimerPaymentMethodData,
    decisionHandler: PrimerPaymentCreationDecisionHandler
  ) {
    if (implementedRNCallbacks?.isOnBeforePaymentCreatedImplemented == true) {

    } else {
      super.onBeforePaymentCreated(paymentMethodData, decisionHandler)
    }
  }

  override fun onTokenizeSuccess(
    paymentMethodTokenData: PrimerPaymentMethodTokenData,
    decisionHandler: PrimerResumeDecisionHandler
  ) {
    super.onTokenizeSuccess(paymentMethodTokenData, decisionHandler)
    val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(paymentMethodTokenData)
    val request = JSONObject(Json.encodeToString(token))
    onTokenizeSuccess = { newClientToken, err ->
      when {
        err != null -> resumeHandler?.handleFailure(err.errorDescription)
        newClientToken != null -> resumeHandler?.continueWithNewClientToken(newClientToken)
        else -> resumeHandler?.handleSuccess()
      }
    }

    resumeHandler = decisionHandler
    sendEvent?.invoke(PrimerEventsRN.OnTokenizeSuccessCallback.string, request)
  }

  override fun onResumeSuccess(resumeToken: String, decisionHandler: PrimerResumeDecisionHandler) {
    super.onResumeSuccess(resumeToken, decisionHandler)
    if (implementedRNCallbacks?.isOnResumeSuccessImplemented == true) {
      onResumeSuccess = { newClientToken, err ->
        when {
          err != null -> resumeHandler?.handleFailure(err.errorDescription)
          newClientToken != null -> resumeHandler?.continueWithNewClientToken(newClientToken)
          else -> resumeHandler?.handleSuccess()
        }
      }

      resumeHandler = decisionHandler
      val resumeToken = mapOf(Keys.RESUME_TOKEN to resumeToken)
      sendEvent?.invoke(
        PrimerEventsRN.OnResumeSuccess.string,
        JSONObject(Json.encodeToString(resumeToken))
      )
    } else {
      sendError?.invoke(
        ErrorTypeRN.InitFailed
          errorTo "Callback [onResumeSuccess] should had been implemented."
      )
    }
  }

  override fun onDismissed() {
    super.onDismissed()
    removeCallbacksAndHandlers()
    if (implementedRNCallbacks?.isOnCheckoutDismissedImplemented == true) {
      sendEvent?.invoke(
        PrimerEventsRN.OnCheckoutDismissed.string,
        null
      )
    } else {
      sendError?.invoke(
        ErrorTypeRN.InitFailed
          errorTo "Callback [onCheckoutDismissed] should had been implemented."
      )
    }
  }

  override fun onFailed(
    error: PrimerError,
    checkoutData: PrimerCheckoutData?,
    errorHandler: PrimerErrorDecisionHandler?
  ) {
    if (implementedRNCallbacks?.isCheckoutFailedImplemented == true) {
      sendError?.invoke(PrimerErrorRN(error.errorId, error.description, error.recoverySuggestion))
    } else {
      super.onFailed(error, checkoutData, errorHandler)
    }
  }

//  override fun onCheckoutEvent(e: CheckoutEvent) {
//    when (e) {
//      is CheckoutEvent.ApiError -> {
//        Log.e("PrimerRN", "ApiError: ${e.data}")
//        val exception = ErrorTypeRN.CheckoutFlowFailed errorTo e.data.description
//        sendError?.invoke(exception)
//      }
//      is CheckoutEvent.TokenizationError -> {
//        if (implementedRNCallbacks?.isCheckoutFailedImplemented == true) {
//          Log.e("PrimerRN", "TokenizationError: ${e.data}")
//          val exception = ErrorTypeRN.TokenizationFailed errorTo e.data.description
//          sendError?.invoke(exception)
//        } else {
//          sendError?.invoke(
//            ErrorTypeRN.InitFailed
//              errorTo "Callback [onResumeError] should had been implemented."
//          )
//        }
//      }
//      else -> Unit
//    }
//  }

  fun onClientTokenCallback(clientToken: String?, error: PrimerErrorRN?) {
    this.clientTokenCallback?.invoke(clientToken, error)
    sendEvent?.invoke(PrimerEventsRN.OnClientTokenCallback.string, null)
  }


  fun onTokenizeSuccess(clientToken: String?, error: PrimerErrorRN?) {
    this.onTokenizeSuccess?.invoke(clientToken, error)
  }

  fun onResumeSuccess(clientToken: String?, error: PrimerErrorRN?) {
    if (implementedRNCallbacks?.isOnResumeSuccessImplemented == true) {
      this.onResumeSuccess?.invoke(clientToken, error)
    } else {
      sendError?.invoke(
        ErrorTypeRN.CheckoutFlowFailed
          errorTo "Callback [onResumeSuccess] should had been implemented."
      )
    }
  }

  fun removeCallbacksAndHandlers() {
    clientTokenCallback = null
    onTokenizeSuccess = null
    onResumeSuccess = null
  }

  fun setImplementedCallbacks(implementedRNCallbacks: PrimerImplementedRNCallbacks) {
    this.implementedRNCallbacks = implementedRNCallbacks
  }
}
