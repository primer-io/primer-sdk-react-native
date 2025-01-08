package com.primerioreactnative

import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.PrimerCheckoutDataRN
import com.primerioreactnative.datamodels.PrimerErrorRN
import com.primerioreactnative.datamodels.PrimerEvents
import com.primerioreactnative.datamodels.PrimerPaymentInstrumentTokenRN
import com.primerioreactnative.extensions.removeType
import com.primerioreactnative.extensions.toCheckoutAdditionalInfoRN
import com.primerioreactnative.extensions.toPrimerCheckoutDataRN
import com.primerioreactnative.extensions.toPrimerClientSessionRN
import com.primerioreactnative.extensions.toPrimerPaymentMethodDataRN
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
import io.primer.android.payments.core.additionalInfo.PrimerCheckoutAdditionalInfo
import io.primer.android.qrcode.QrCodeCheckoutAdditionalInfo
import io.primer.android.vouchers.multibanco.MultibancoCheckoutAdditionalInfo
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
  var sendErrorWithCheckoutData: ((error: PrimerErrorRN, checkoutData: PrimerCheckoutDataRN?) -> Unit)? =
    null
  var onDismissedEvent: (() -> Unit)? = null

  override fun onCheckoutCompleted(checkoutData: PrimerCheckoutData) {
    if (implementedRNCallbacks?.isOnCheckoutCompleteImplemented == true) {
      sendEvent?.invoke(
        PrimerEvents.ON_CHECKOUT_COMPLETE.eventName,
        JSONObject(Json.encodeToString(checkoutData.toPrimerCheckoutDataRN())).apply {
          val additionalInfoJson = optJSONObject(Keys.ADDITIONAL_INFO)
          additionalInfoJson?.removeType()
          putOpt(Keys.ADDITIONAL_INFO, additionalInfoJson)
        },
      )
    } else {
      sendError?.invoke(
        ErrorTypeRN.NativeBridgeFailed
          errorTo "Callback [onCheckoutComplete] should be implemented.",
      )
    }
  }

  override fun onBeforePaymentCreated(
    paymentMethodData: PrimerPaymentMethodData,
    decisionHandler: PrimerPaymentCreationDecisionHandler,
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
        JSONObject(Json.encodeToString(paymentMethodData.toPrimerPaymentMethodDataRN())),
      )
    } else {
      super.onBeforePaymentCreated(paymentMethodData, decisionHandler)
    }
  }

  override fun onBeforeClientSessionUpdated() {
    if (implementedRNCallbacks?.isOnBeforeClientSessionUpdateImplemented == true) {
      sendEvent?.invoke(
        PrimerEvents.ON_BEFORE_CLIENT_SESSION_UPDATE.eventName,
        null,
      )
    } else {
      super.onBeforeClientSessionUpdated()
    }
  }

  override fun onClientSessionUpdated(clientSession: PrimerClientSession) {
    if (implementedRNCallbacks?.isOnClientSessionUpdateImplemented == true) {
      sendEvent?.invoke(
        PrimerEvents.ON_CLIENT_SESSION_UPDATE.eventName,
        JSONObject().apply {
          put(
            "clientSession",
            JSONObject(Json.encodeToString(clientSession.toPrimerClientSessionRN())),
          )
        },
      )
    } else {
      super.onClientSessionUpdated(clientSession)
    }
  }

  override fun onTokenizeSuccess(
    paymentMethodTokenData: PrimerPaymentMethodTokenData,
    decisionHandler: PrimerResumeDecisionHandler,
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
          errorTo "Callback [onTokenizeSuccess] should be implemented.",
      )
    }
  }

  override fun onResumeSuccess(
    resumeToken: String,
    decisionHandler: PrimerResumeDecisionHandler,
  ) {
    if (implementedRNCallbacks?.isOnCheckoutResumeImplemented == true) {
      resumeSuccessDecisionHandler = { newClientToken, err ->
        when {
          err != null -> decisionHandler.handleFailure(err.ifBlank { null })
          newClientToken != null -> decisionHandler.continueWithNewClientToken(newClientToken)
          else -> decisionHandler.handleSuccess()
        }
      }

      sendEvent?.invoke(
        PrimerEvents.ON_RESUME_SUCCESS.eventName,
        JSONObject(Json.encodeToString(mapOf(Keys.RESUME_TOKEN to resumeToken))),
      )
    } else {
      sendError?.invoke(
        ErrorTypeRN.NativeBridgeFailed
          errorTo "Callback [onResumeSuccess] should be implemented.",
      )
    }
  }

  override fun onResumePending(additionalInfo: PrimerCheckoutAdditionalInfo) {
    if (implementedRNCallbacks?.isOnCheckoutPendingImplemented == true) {
      if (additionalInfo is MultibancoCheckoutAdditionalInfo) {
        sendEvent?.invoke(
          PrimerEvents.ON_RESUME_PENDING.eventName,
          JSONObject(Json.encodeToString(additionalInfo.toCheckoutAdditionalInfoRN())).apply {
            removeType()
          },
        )
      }
    } else {
      sendError?.invoke(
        ErrorTypeRN.NativeBridgeFailed
          errorTo "Callback [onResumePending] should be implemented.",
      )
    }
  }

  override fun onAdditionalInfoReceived(additionalInfo: PrimerCheckoutAdditionalInfo) {
    if (implementedRNCallbacks?.isOnCheckoutAdditionalInfoImplemented == true) {
      if (additionalInfo is QrCodeCheckoutAdditionalInfo) {
        sendEvent?.invoke(
          PrimerEvents.ON_CHECKOUT_RECEIVED_ADDITIONAL_INFO.eventName,
          JSONObject(Json.encodeToString(additionalInfo.toCheckoutAdditionalInfoRN())).apply {
            removeType()
          },
        )
      }
    } else {
      sendError?.invoke(
        ErrorTypeRN.NativeBridgeFailed
          errorTo "Callback [onAdditionalInfoReceived] should be implemented.",
      )
    }
  }

  override fun onDismissed() {
    if (implementedRNCallbacks?.isOnDismissImplemented == true) {
      sendEvent?.invoke(
        PrimerEvents.ON_DISMISS.eventName,
        null,
      )
    }

    onDismissedEvent?.invoke()
    removeCallbacksAndHandlers()
  }

  override fun onFailed(
    error: PrimerError,
    checkoutData: PrimerCheckoutData?,
    errorHandler: PrimerErrorDecisionHandler?,
  ) {
    if (implementedRNCallbacks?.isOnErrorImplemented == true) {
      primerErrorDecisionHandler = { errorMessage: String? ->
        errorHandler?.showErrorMessage(errorMessage?.ifBlank { null })
      }
      sendErrorWithCheckoutData?.invoke(
        PrimerErrorRN(
          errorId = error.errorId,
          errorCode = error.errorCode,
          description = error.description,
          diagnosticsId = error.diagnosticsId,
          recoverySuggestion = error.recoverySuggestion,
        ),
        checkoutData?.toPrimerCheckoutDataRN(),
      )
    } else {
      super.onFailed(error, checkoutData, errorHandler)
    }
  }

  override fun onFailed(
    error: PrimerError,
    errorHandler: PrimerErrorDecisionHandler?,
  ) {
    if (implementedRNCallbacks?.isOnErrorImplemented == true) {
      primerErrorDecisionHandler = { errorMessage: String? ->
        errorHandler?.showErrorMessage(errorMessage)
      }
      sendError?.invoke(
        PrimerErrorRN(
          errorId = error.errorId,
          errorCode = error.errorCode,
          description = error.description,
          diagnosticsId = error.diagnosticsId,
          recoverySuggestion = error.recoverySuggestion,
        ),
      )
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
      errorMessage.ifBlank { null },
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
      errorMessage.ifBlank { null },
    )
    resumeSuccessDecisionHandler = null
  }
  // endregion

  // region payment create handlers
  fun handlePaymentCreationContinue() {
    paymentCreationDecisionHandler?.invoke(null)
    paymentCreationDecisionHandler = null
  }

  fun handlePaymentCreationAbort(errorMessage: String) {
    paymentCreationDecisionHandler?.invoke(errorMessage)
    paymentCreationDecisionHandler = null
  }
  // endregion

  // region error handlers
  fun handleErrorMessage(errorMessage: String) {
    primerErrorDecisionHandler?.invoke(errorMessage)
    primerErrorDecisionHandler = null
  }
  // endregion

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
