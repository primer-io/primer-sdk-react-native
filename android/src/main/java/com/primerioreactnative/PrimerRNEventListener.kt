package com.primerioreactnative

import android.util.Log
import com.primerioreactnative.datamodels.*
import io.primer.android.CheckoutEventListener
import io.primer.android.completion.ActionResumeHandler
import io.primer.android.completion.ResumeHandler
import io.primer.android.events.CheckoutEvent
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class PrimerRNEventListener : CheckoutEventListener {

  private var clientTokenCallback: ((String?, Error?) -> Unit)? = null
  private var onClientSessionActions: ((String?, Error?) -> Unit)? = null
  private var onTokenizeSuccess: ((String?, Error?) -> Unit)? = null
  private var onResumeSuccess: ((String?, Error?) -> Unit)? = null

  var sendEvent: ((eventName: String, paramsJson: String?) -> Unit)? = null
  var sendError: ((paramsJson: String) -> Unit)? = null

  var resumeHandler: ResumeHandler? = null
  var actionResumeHandler: ActionResumeHandler? = null

  override fun onClientSessionActions(event: CheckoutEvent.OnClientSessionActions) {
    val token = PrimerOnClientSessionActionsRequestRN.build(event.data)
    val request = Json.encodeToString(token)

    onClientSessionActions = { newClientToken, err ->
      when {
          err != null -> resumeHandler?.handleError(err)
          newClientToken != null -> resumeHandler?.handleNewClientToken(newClientToken)
          else -> resumeHandler?.handleSuccess()
      }
    }

    actionResumeHandler = event.resumeHandler

    sendEvent?.invoke(PrimerEventsRN.OnClientSessionActions.string, request)
  }

  override fun onCheckoutEvent(e: CheckoutEvent) {
    when (e) {
      is CheckoutEvent.TokenizationSuccess -> {
        val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(e.data)
        val request = Json.encodeToString(token)
        onTokenizeSuccess = { newClientToken, err ->
          when {
            err != null -> resumeHandler?.handleError(err)
            newClientToken != null -> resumeHandler?.handleNewClientToken(newClientToken)
            else -> resumeHandler?.handleSuccess()
          }
        }

        resumeHandler = e.resumeHandler
        sendEvent?.invoke(PrimerEventsRN.OnTokenizeSuccessCallback.string, request)
      }
      is CheckoutEvent.ResumeSuccess -> {
        val token = e.resumeToken
        onResumeSuccess = { newClientToken, err ->
          when {
            err != null -> resumeHandler?.handleError(err)
            newClientToken != null -> resumeHandler?.handleNewClientToken(newClientToken)
            else -> resumeHandler?.handleSuccess()
          }
        }
        resumeHandler = e.resumeHandler
        val resumeToken = token to Keys.RESUME_TOKEN
        sendEvent?.invoke(
          PrimerEventsRN.OnResumeSuccess.string,
          Json.encodeToString(resumeToken)
        )
      }
      is CheckoutEvent.ApiError -> {
        Log.e("PrimerRN", "ApiError: ${e.data}")
        val exception = PrimerErrorRN(
          ErrorTypeRN.CheckoutFlowFailed,
          e.data.description,
        )
        val data = Json.encodeToString(exception)
        sendError?.invoke(data)
      }
      is CheckoutEvent.TokenAddedToVault -> {
        val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(e.data)
        val request = Json.encodeToString(token)
        sendEvent?.invoke(
          PrimerEventsRN.OnVaultSuccess.string,
          request
        )
      }
      is CheckoutEvent.TokenSelected -> {
        val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(e.data)
        val request = Json.encodeToString(token)
        onTokenizeSuccess = { newClientToken, err ->
          when {
            err != null -> resumeHandler?.handleError(err)
            newClientToken != null -> resumeHandler?.handleNewClientToken(newClientToken)
            else -> resumeHandler?.handleSuccess()
          }
        }

        resumeHandler = e.resumeHandler
        sendEvent?.invoke(PrimerEventsRN.OnTokenizeSuccessCallback.string, request)
      }
      is CheckoutEvent.Exit -> {
        removeCallbacksAndHandlers()
        sendEvent?.invoke(
          PrimerEventsRN.OnCheckoutDismissed.string,
          null
        )
      }
      is CheckoutEvent.TokenizationError -> {
        Log.e("PrimerRN", "TokenizationError: ${e.data}")
        val exception = PrimerErrorRN(
          ErrorTypeRN.TokenizationFailed,
          e.data.description,
        )
        val data = Json.encodeToString(exception)
        sendError?.invoke(data)
      }
      else -> Unit
    }
  }

  fun onClientTokenCallback(clientToken: String?, error: Error?) {
    this.clientTokenCallback?.invoke(clientToken, error)
  }

  fun onClientSessionActions(clientToken: String?, error: Error?) {
    this.onClientSessionActions?.invoke(clientToken, error)
  }

  fun onTokenizeSuccess(clientToken: String?, error: Error?) {
    this.onTokenizeSuccess?.invoke(clientToken, error)
  }

  fun onResumeSuccess(clientToken: String?, error: Error?) {
    this.onResumeSuccess?.invoke(clientToken, error)
  }

  fun removeCallbacksAndHandlers() {
    clientTokenCallback = null
    onClientSessionActions = null
    onTokenizeSuccess = null
    onResumeSuccess = null
  }
}
