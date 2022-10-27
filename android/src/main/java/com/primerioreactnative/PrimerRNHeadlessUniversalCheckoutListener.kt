package com.primerioreactnative

import com.facebook.react.bridge.Promise
import com.primerioreactnative.datamodels.*
import com.primerioreactnative.extensions.toCheckoutAdditionalInfoRN
import com.primerioreactnative.extensions.toPrimerCheckoutDataRN
import com.primerioreactnative.extensions.toPrimerClientSessionRN
import com.primerioreactnative.extensions.toPrimerPaymentMethodDataRN
import com.primerioreactnative.huc.datamodels.core.PrimerRNAvailablePaymentMethods
import com.primerioreactnative.huc.datamodels.core.toPrimerRNHeadlessUniversalCheckoutPaymentMethod
import com.primerioreactnative.huc.events.PrimerHeadlessUniversalCheckoutEvent
import com.primerioreactnative.utils.PrimerHeadlessUniversalCheckoutImplementedRNCallbacks
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.errorTo
import io.primer.android.ExperimentalPrimerApi
import io.primer.android.completion.PrimerPaymentCreationDecisionHandler
import io.primer.android.completion.PrimerResumeDecisionHandler
import io.primer.android.components.PrimerHeadlessUniversalCheckoutEventsListener
import io.primer.android.components.domain.core.models.PrimerHeadlessUniversalCheckoutPaymentMethod
import io.primer.android.domain.PrimerCheckoutData
import io.primer.android.domain.action.models.PrimerClientSession
import io.primer.android.domain.error.models.PrimerError
import io.primer.android.domain.payments.additionalInfo.MultibancoCheckoutAdditionalInfo
import io.primer.android.domain.payments.additionalInfo.PrimerCheckoutAdditionalInfo
import io.primer.android.domain.payments.additionalInfo.PromptPayCheckoutAdditionalInfo
import io.primer.android.domain.tokenization.models.PrimerPaymentMethodData
import io.primer.android.domain.tokenization.models.PrimerPaymentMethodTokenData
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

@OptIn(ExperimentalPrimerApi::class)
class PrimerRNHeadlessUniversalCheckoutListener : PrimerHeadlessUniversalCheckoutEventsListener {
  private var paymentCreationDecisionHandler: ((errorMessage: String?) -> Unit)? = null
  private var tokenizeSuccessDecisionHandler: ((resumeToken: String?, errorMessage: String?) -> Unit)? =
    null
  private var resumeSuccessDecisionHandler: ((resumeToken: String?, errorMessage: String?) -> Unit)? =
    null
  private var implementedRNCallbacks: PrimerHeadlessUniversalCheckoutImplementedRNCallbacks? = null

  var sendEvent: ((eventName: String, paramsJson: JSONObject?) -> Unit)? = null

  var sendError: ((error: PrimerErrorRN) -> Unit)? = null
  var sendErrorWithCheckoutData: ((error: PrimerErrorRN, checkoutData: PrimerCheckoutDataRN?) -> Unit)? =
    null

  var successCallback: Promise? = null

  override fun onAvailablePaymentMethodsLoaded(paymentMethods: List<PrimerHeadlessUniversalCheckoutPaymentMethod>) {
    sendEvent?.invoke(
      PrimerHeadlessUniversalCheckoutEvent.ON_AVAILABLE_PAYMENT_METHODS_LOADED.eventName,
      JSONObject(Json.encodeToString(PrimerRNAvailablePaymentMethods(paymentMethods.map { it.toPrimerRNHeadlessUniversalCheckoutPaymentMethod() })))
    )
    successCallback?.resolve(
      convertJsonToMap(
        JSONObject(Json.encodeToString(PrimerRNAvailablePaymentMethods(paymentMethods.map { it.toPrimerRNHeadlessUniversalCheckoutPaymentMethod() })))
      )
    )
  }

//  override fun onPreparationStarted(paymentMethodType: String) {
//    sendEvent?.invoke(
//      PrimerHeadlessUniversalCheckoutEvent.ON_HUC_PREPARE_START.eventName,
//      JSONObject(Json.encodeToString(PrimerPaymentMethodDataRN(paymentMethodType)))
//    )
//  }
//
//  override fun onPaymentMethodShowed(paymentMethodType: String) {
//    sendEvent?.invoke(
//      PrimerHeadlessUniversalCheckoutEvent.ON_HUC_PAYMENT_METHOD_SHOW.eventName,
//      JSONObject(Json.encodeToString(PrimerPaymentMethodDataRN(paymentMethodType)))
//    )
//  }

  override fun onTokenizationStarted(paymentMethodType: String) {
    sendEvent?.invoke(
      PrimerHeadlessUniversalCheckoutEvent.ON_HUC_TOKENIZE_START.eventName,
      JSONObject(Json.encodeToString(PrimerPaymentMethodDataRN(paymentMethodType)))
    )
  }

  override fun onCheckoutCompleted(checkoutData: PrimerCheckoutData) {
    if (implementedRNCallbacks?.isOnCheckoutCompleteImplemented == true) {
      sendEvent?.invoke(
        PrimerHeadlessUniversalCheckoutEvent.ON_CHECKOUT_COMPLETE.eventName,
        JSONObject(Json.encodeToString(checkoutData.toPrimerCheckoutDataRN())).apply {
          val additionalInfoJson = optJSONObject(Keys.ADDITIONAL_INFO)
          additionalInfoJson?.remove("type")
          putOpt(Keys.ADDITIONAL_INFO, additionalInfoJson)
        }
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
    createPaymentHandler: PrimerPaymentCreationDecisionHandler
  ) {
    if (implementedRNCallbacks?.isOnBeforePaymentCreateImplemented == true) {
      paymentCreationDecisionHandler = { errorMessage ->
        when {
          errorMessage != null -> createPaymentHandler.abortPaymentCreation(errorMessage.ifBlank { null })
          else -> createPaymentHandler.continuePaymentCreation()
        }
      }
      sendEvent?.invoke(
        PrimerHeadlessUniversalCheckoutEvent.ON_BEFORE_PAYMENT_CREATE.eventName,
        JSONObject(Json.encodeToString(paymentMethodData.toPrimerPaymentMethodDataRN()))
      )
    } else {
      super.onBeforePaymentCreated(paymentMethodData, createPaymentHandler)
    }
  }

  override fun onBeforeClientSessionUpdated() {
    if (implementedRNCallbacks?.isOnBeforeClientSessionUpdateImplemented == true) {
      sendEvent?.invoke(
        PrimerHeadlessUniversalCheckoutEvent.ON_BEFORE_CLIENT_SESSION_UPDATE.eventName,
        null
      )
    } else {
      super.onBeforeClientSessionUpdated()
    }
  }

  override fun onClientSessionUpdated(clientSession: PrimerClientSession) {
    if (implementedRNCallbacks?.isOnClientSessionUpdateImplemented == true) {
      sendEvent?.invoke(
        PrimerHeadlessUniversalCheckoutEvent.ON_CLIENT_SESSION_UPDATE.eventName,
        JSONObject(Json.encodeToString(clientSession.toPrimerClientSessionRN()))
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
      sendEvent?.invoke(PrimerHeadlessUniversalCheckoutEvent.ON_TOKENIZE_SUCCESS.eventName, request)
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
    if (implementedRNCallbacks?.isOnCheckoutResumeImplemented == true) {
      resumeSuccessDecisionHandler = { newClientToken, err ->
        when {
          err != null -> decisionHandler.handleFailure(err.ifBlank { null })
          newClientToken != null -> decisionHandler.continueWithNewClientToken(newClientToken)
          else -> decisionHandler.handleSuccess()
        }
      }

      val resumeToken = mapOf(Keys.RESUME_TOKEN to resumeToken)
      sendEvent?.invoke(
        PrimerHeadlessUniversalCheckoutEvent.ON_CHECKOUT_SUCCESS.eventName,
        JSONObject(Json.encodeToString(resumeToken))
      )
    } else {
      sendError?.invoke(
        ErrorTypeRN.NativeBridgeFailed
          errorTo "Callback ${PrimerHeadlessUniversalCheckoutEvent.ON_CHECKOUT_SUCCESS.eventName} should be implemented."
      )
    }
  }

  override fun onResumePending(additionalInfo: PrimerCheckoutAdditionalInfo) {
    if (implementedRNCallbacks?.isOnCheckoutPendingImplemented == true) {
      if (additionalInfo is MultibancoCheckoutAdditionalInfo) {
        sendEvent?.invoke(
          PrimerHeadlessUniversalCheckoutEvent.ON_CHECKOUT_PENDING.eventName,
          JSONObject(Json.encodeToString(additionalInfo.toCheckoutAdditionalInfoRN())).apply {
            remove("type")
          }
        )
      }
    } else {
      sendError?.invoke(
        ErrorTypeRN.NativeBridgeFailed
          errorTo "Callback [${PrimerHeadlessUniversalCheckoutEvent.ON_CHECKOUT_PENDING.eventName}] " +
          "should be implemented."
      )
    }
  }

  override fun onAdditionalInfoReceived(additionalInfo: PrimerCheckoutAdditionalInfo) {
    if (implementedRNCallbacks?.isOnCheckoutAdditionalInfoImplemented == true) {
      if (additionalInfo is PromptPayCheckoutAdditionalInfo) {
        sendEvent?.invoke(
          PrimerHeadlessUniversalCheckoutEvent.ON_CHECKOUT_ADDITIONAL_INFO.eventName,
          JSONObject(Json.encodeToString(additionalInfo.toCheckoutAdditionalInfoRN())).apply {
            remove("type")
          }
        )
      }
    } else {
      sendError?.invoke(
        ErrorTypeRN.NativeBridgeFailed
          errorTo "Callback [${PrimerHeadlessUniversalCheckoutEvent.ON_CHECKOUT_ADDITIONAL_INFO.eventName}]" +
          " should be implemented."
      )
    }
  }

  override fun onFailed(
    error: PrimerError,
    checkoutData: PrimerCheckoutData?,
  ) {
    if (implementedRNCallbacks?.isOnErrorImplemented == true) {
      sendErrorWithCheckoutData?.invoke(
        PrimerErrorRN(
          error.errorId,
          error.description,
          error.recoverySuggestion
        ), checkoutData?.toPrimerCheckoutDataRN()
      )
    } else {
      super.onFailed(error, checkoutData)
    }
  }

  override fun onFailed(error: PrimerError) {
    if (implementedRNCallbacks?.isOnErrorImplemented == true) {
      sendError?.invoke(PrimerErrorRN(error.errorId, error.description, error.recoverySuggestion))
    } else {
      super.onFailed(error)
    }
  }

  // region tokenization handlers
  fun handleTokenizationNewClientToken(newClientToken: String) {
    tokenizeSuccessDecisionHandler?.invoke(newClientToken, null)
    tokenizeSuccessDecisionHandler = null
  }
  // endregion

  // region resume handlers
  fun handleResumeNewClientToken(newClientToken: String) {
    resumeSuccessDecisionHandler?.invoke(newClientToken, null)
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

  fun setImplementedCallbacks(
    implementedRNCallbacks:
    PrimerHeadlessUniversalCheckoutImplementedRNCallbacks
  ) {
    this.implementedRNCallbacks = implementedRNCallbacks
  }

  fun removeCallbacksAndHandlers() {
    paymentCreationDecisionHandler = null
    tokenizeSuccessDecisionHandler = null
    resumeSuccessDecisionHandler = null
    implementedRNCallbacks = null
  }
}
