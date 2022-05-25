package com.primerioreactnative

import com.primerioreactnative.datamodels.*
import com.primerioreactnative.utils.PrimerImplementedRNCallbacks
import com.primerioreactnative.utils.errorTo
import io.primer.android.PrimerCheckoutListener
import io.primer.android.completion.PrimerErrorDecisionHandler
import io.primer.android.completion.PrimerPaymentCreationDecisionHandler
import io.primer.android.completion.PrimerResumeDecisionHandler
import io.primer.android.domain.PrimerCheckoutData
import io.primer.android.domain.action.models.PrimerClientSession
import io.primer.android.domain.error.models.PrimerError
import io.primer.android.domain.tokenization.models.PrimerPaymentMethodData
import io.primer.android.domain.tokenization.models.PrimerPaymentMethodTokenData
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

class PrimerRNEventListener : PrimerCheckoutListener {

  private var paymentCreationDecisionHandler: ((errorMessage: String?) -> Unit)? = null
  private var primerErrorDecisionHandler: ((errorMessage: String?) -> Unit)? = null
  private var tokenizeSuccessDecisionHandler: ((resumeToken: String?, errorMessage: String?) -> Unit)? =
    null
  private var resumeSuccessDecisionHandler: ((resumeToken: String?, errorMessage: String?) -> Unit)? =
    null
  private var implementedRNCallbacks: PrimerImplementedRNCallbacks? = null

  var sendEvent: ((eventName: String, paramsJson: JSONObject?) -> Unit)? = null
  var sendError: ((error: PrimerErrorRN) -> Unit)? = null

  override fun onCheckoutCompleted(checkoutData: PrimerCheckoutData) {
    if (implementedRNCallbacks?.isOnCheckoutCompleteImplemented == true) {
      sendEvent?.invoke(
        PrimerEvents.ON_CHECKOUT_COMPLETE.eventName,
        JSONObject(Json.encodeToString(checkoutData.toPrimerCheckoutDataRN()))
      )
    } else {
      sendError?.invoke(
        ErrorTypeRN.NativeBridgeFailed
          errorTo "Callback [onCheckoutComplete] should be implemented."
      )
    }
  }

  override fun onBeforePaymentCreated(
    paymentMethodData: PrimerPaymentMethodData,
    decisionHandler: PrimerPaymentCreationDecisionHandler
  ) {
    if (implementedRNCallbacks?.isOnBeforePaymentCreateImplemented == true) {
      paymentCreationDecisionHandler = { errorMessage ->
        when {
          errorMessage != null -> decisionHandler.abortPaymentCreation(errorMessage.ifBlank { null })
          else -> decisionHandler.continuePaymentCreation()
        }
      }
      sendEvent?.invoke(
        PrimerEvents.ON_BEFORE_PAYMENT_CREATE.eventName,
        JSONObject(Json.encodeToString(paymentMethodData.toPrimerPaymentMethodDataRN()))
      )
    } else {
      super.onBeforePaymentCreated(paymentMethodData, decisionHandler)
    }
  }

  override fun onBeforeClientSessionUpdated() {
    if (implementedRNCallbacks?.isOnBeforeClientSessionUpdateImplemented == true) {
      sendEvent?.invoke(
        PrimerEvents.ON_BEFORE_CLIENT_SESSION_UPDATE.eventName,
        null
      )
    } else {
      super.onBeforeClientSessionUpdated()
    }
  }

  override fun onClientSessionUpdated(clientSession: PrimerClientSession) {
    if (implementedRNCallbacks?.isOnClientSessionUpdateImplemented == true) {
      sendEvent?.invoke(
        PrimerEvents.ON_CLIENT_SESSION_UPDATE.eventName,
        JSONObject(Json.encodeToString(clientSession))
      )
    } else {
      super.onClientSessionUpdated(clientSession)
    }
  }

  override fun onTokenizeSuccess(
    paymentMethodTokenData: PrimerPaymentMethodTokenData,
    decisionHandler: PrimerResumeDecisionHandler
  ) {
    if (implementedRNCallbacks?.isOnTokenizeSuccessImplemented == true) {
      val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(paymentMethodTokenData)
      val request = JSONObject(Json.encodeToString(token))
      tokenizeSuccessDecisionHandler = { newClientToken, err ->
        when {
          err != null -> decisionHandler.handleFailure(err.ifBlank { null })
          newClientToken != null -> decisionHandler.continueWithNewClientToken(newClientToken)
          else -> decisionHandler.handleSuccess()
        }
      }
      sendEvent?.invoke(PrimerEvents.ON_TOKENIZE_SUCCESS.eventName, request)
    } else {
      sendError?.invoke(
        ErrorTypeRN.NativeBridgeFailed
          errorTo "Callback [onTokenizeSuccess] should be implemented."
      )
    }
  }

  override fun onResumeSuccess(
    resumeToken: String,
    decisionHandler: PrimerResumeDecisionHandler
  ) {
    if (implementedRNCallbacks?.isOnResumeSuccessImplemented == true) {
      resumeSuccessDecisionHandler = { newClientToken, err ->
        when {
          err != null -> decisionHandler.handleFailure(err.ifBlank { null })
          newClientToken != null -> decisionHandler.continueWithNewClientToken(newClientToken)
          else -> decisionHandler.handleSuccess()
        }
      }

      val resumeToken = mapOf(Keys.RESUME_TOKEN to resumeToken)
      sendEvent?.invoke(
        PrimerEvents.ON_RESUME_SUCCESS.eventName,
        JSONObject(Json.encodeToString(resumeToken))
      )
    } else {
      sendError?.invoke(
        ErrorTypeRN.NativeBridgeFailed
          errorTo "Callback [onResumeSuccess] should be implemented."
      )
    }
  }

  override fun onDismissed() {
    removeCallbacksAndHandlers()
    if (implementedRNCallbacks?.isOnDismissImplemented == true) {
      sendEvent?.invoke(
        PrimerEvents.ON_DISMISS.eventName,
        null
      )
    }
  }

  override fun onFailed(
    error: PrimerError,
    checkoutData: PrimerCheckoutData?,
    errorHandler: PrimerErrorDecisionHandler?
  ) {
    if (implementedRNCallbacks?.isOnCheckoutFailImplemented == true) {
      primerErrorDecisionHandler = { errorMessage: String? ->
        errorHandler?.showErrorMessage(errorMessage?.ifBlank { null })
      }
      sendError?.invoke(PrimerErrorRN(error.errorId, error.description, error.recoverySuggestion))
    } else {
      super.onFailed(error, checkoutData, errorHandler)
    }
  }

  override fun onFailed(error: PrimerError, errorHandler: PrimerErrorDecisionHandler?) {
    if (implementedRNCallbacks?.isOnCheckoutFailImplemented == true) {
      primerErrorDecisionHandler = { errorMessage: String? ->
        errorHandler?.showErrorMessage(errorMessage)
      }
      sendError?.invoke(PrimerErrorRN(error.errorId, error.description, error.recoverySuggestion))
    } else {
      super.onFailed(error, errorHandler)
    }
  }


  // region tokenization handlers
  fun handleTokenizationNewClientToken(newClientToken: String) {
    tokenizeSuccessDecisionHandler?.invoke(newClientToken, null)
    tokenizeSuccessDecisionHandler = null
  }

  fun handleTokenizationSuccess() {
    tokenizeSuccessDecisionHandler?.invoke(null, null)
    tokenizeSuccessDecisionHandler = null
  }

  fun handleTokenizationFailure(errorMessage: String) {
    tokenizeSuccessDecisionHandler?.invoke(
      null,
      errorMessage.ifBlank { null }
    )
    tokenizeSuccessDecisionHandler = null
  }
  // endregion

  // region resume handlers
  fun handleResumeNewClientToken(newClientToken: String) {
    resumeSuccessDecisionHandler?.invoke(newClientToken, null)
    resumeSuccessDecisionHandler = null
  }

  fun handleResumeSuccess() {
    resumeSuccessDecisionHandler?.invoke(null, null)
    resumeSuccessDecisionHandler = null
  }

  fun handleResumeFailure(errorMessage: String) {
    resumeSuccessDecisionHandler?.invoke(
      null,
      errorMessage.ifBlank { null }
    )
    resumeSuccessDecisionHandler = null
  }
  // endregion

  fun handlePaymentCreationContinue() {
    paymentCreationDecisionHandler?.invoke(null)
    paymentCreationDecisionHandler = null
  }

  fun handlePaymentCreationAbort(errorMessage: String) {
    paymentCreationDecisionHandler?.invoke(errorMessage)
    paymentCreationDecisionHandler = null
  }

  fun handleErrorMessage(errorMessage: String) {
    primerErrorDecisionHandler?.invoke(errorMessage)
    primerErrorDecisionHandler = null
  }

  fun setImplementedCallbacks(implementedRNCallbacks: PrimerImplementedRNCallbacks) {
    this.implementedRNCallbacks = implementedRNCallbacks
  }

  private fun removeCallbacksAndHandlers() {
    paymentCreationDecisionHandler = null
    primerErrorDecisionHandler = null
    tokenizeSuccessDecisionHandler = null
    resumeSuccessDecisionHandler = null
    implementedRNCallbacks = null
  }
}
