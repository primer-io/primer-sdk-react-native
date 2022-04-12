package com.primerioreactnative

import android.util.Log
import com.primerioreactnative.datamodels.*
import com.primerioreactnative.utils.PrimerImplementedRNCallbacks
import com.primerioreactnative.utils.asError
import com.primerioreactnative.utils.errorTo
import io.primer.android.CheckoutEventListener
import io.primer.android.completion.ResumeHandler
import io.primer.android.events.CheckoutEvent
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

class PrimerRNEventListener : CheckoutEventListener {

  private var clientTokenCallback: ((String?, PrimerErrorRN?) -> Unit)? = null
  private var onClientSessionActions: ((String?, PrimerErrorRN?) -> Unit)? = null
  private var onTokenizeSuccess: ((String?, PrimerErrorRN?) -> Unit)? = null
  private var onResumeSuccess: ((String?, PrimerErrorRN?) -> Unit)? = null
  private var implementedRNCallbacks: PrimerImplementedRNCallbacks? = null

  private var resumeHandler: ResumeHandler? = null

  var sendEvent: ((eventName: String, paramsJson: JSONObject?) -> Unit)? = null
  var sendError: ((error: PrimerErrorRN) -> Unit)? = null

  override fun onClientSessionActions(event: CheckoutEvent.OnClientSessionActions) {
    val token = PrimerOnClientSessionActionsRequestRN.build(event.data)
    val request = JSONObject(Json.encodeToString(token))

    onClientSessionActions = { newClientToken, err ->
      when {
          err != null -> resumeHandler?.handleError(err.asError())
          newClientToken != null -> resumeHandler?.handleNewClientToken(newClientToken)
          else -> resumeHandler?.handleSuccess()
      }
    }

    event.resumeHandler.handleClientToken(null)
    sendEvent?.invoke(PrimerEventsRN.OnClientSessionActions.string, request)
  }

  override fun onCheckoutEvent(e: CheckoutEvent) {
    when (e) {
      is CheckoutEvent.TokenizationSuccess -> {
        val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(e.data)
        val request = JSONObject(Json.encodeToString(token))
        onTokenizeSuccess = { newClientToken, err ->
          when {
            err != null -> resumeHandler?.handleError(err.asError())
            newClientToken != null -> resumeHandler?.handleNewClientToken(newClientToken)
            else -> resumeHandler?.handleSuccess()
          }
        }

        resumeHandler = e.resumeHandler
        sendEvent?.invoke(PrimerEventsRN.OnTokenizeSuccessCallback.string, request)
      }
      is CheckoutEvent.ResumeSuccess -> {
        val token = e.resumeToken
        if (implementedRNCallbacks?.isOnResumeSuccessImplemented == true) {
          onResumeSuccess = { newClientToken, err ->
            when {
              err != null -> resumeHandler?.handleError(err.asError())
              newClientToken != null -> resumeHandler?.handleNewClientToken(newClientToken)
              else -> resumeHandler?.handleSuccess()
            }
          }

          resumeHandler = e.resumeHandler
          val resumeToken = mapOf(Keys.RESUME_TOKEN to token)
          sendEvent?.invoke(
            PrimerEventsRN.OnResumeSuccess.string,
            JSONObject(Json.encodeToString(resumeToken))
          )
        } else {
          sendError?.invoke(ErrorTypeRN.InitFailed
            errorTo "Callback [onResumeSuccess] should had been implemented.")
        }
      }
      is CheckoutEvent.ApiError -> {
        Log.e("PrimerRN", "ApiError: ${e.data}")
        val exception = ErrorTypeRN.CheckoutFlowFailed errorTo e.data.description
        sendError?.invoke(exception)
      }
      is CheckoutEvent.TokenAddedToVault -> {
        val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(e.data)
        val request = JSONObject(Json.encodeToString(token))
        sendEvent?.invoke(
          PrimerEventsRN.OnVaultSuccess.string,
          request
        )
      }
      is CheckoutEvent.TokenSelected -> {
        val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(e.data)
        val request = JSONObject(Json.encodeToString(token))
        onTokenizeSuccess = { newClientToken, err ->
          when {
            err != null -> resumeHandler?.handleError(err.asError())
            newClientToken != null -> resumeHandler?.handleNewClientToken(newClientToken)
            else -> resumeHandler?.handleSuccess()
          }
        }

        resumeHandler = e.resumeHandler
        sendEvent?.invoke(PrimerEventsRN.OnTokenizeSuccessCallback.string, request)
      }
      is CheckoutEvent.Exit -> {
        removeCallbacksAndHandlers()
        if (implementedRNCallbacks?.isOnCheckoutDismissedImplemented == true) {
          sendEvent?.invoke(
            PrimerEventsRN.OnCheckoutDismissed.string,
            null
          )
        } else {
          sendError?.invoke(ErrorTypeRN.InitFailed
            errorTo "Callback [onCheckoutDismissed] should had been implemented.")
        }
      }
      is CheckoutEvent.TokenizationError -> {
        if (implementedRNCallbacks?.isCheckoutFailedImplemented == true) {
          Log.e("PrimerRN", "TokenizationError: ${e.data}")
          val exception = ErrorTypeRN.TokenizationFailed errorTo e.data.description
          sendError?.invoke(exception)
        } else {
          sendError?.invoke(ErrorTypeRN.InitFailed
            errorTo "Callback [onResumeError] should had been implemented.")
        }
      }
      else -> Unit
    }
  }

  fun onClientTokenCallback(clientToken: String?, error: PrimerErrorRN?) {
    this.clientTokenCallback?.invoke(clientToken, error)
    sendEvent?.invoke(PrimerEventsRN.OnClientTokenCallback.string, null)
  }

  fun onClientSessionActions(clientToken: String?, error: PrimerErrorRN?) {
    if (implementedRNCallbacks?.isClientSessionActionsImplemented == true) {
      this.onClientSessionActions?.invoke(clientToken, error)
    }
  }

  fun onTokenizeSuccess(clientToken: String?, error: PrimerErrorRN?) {
    this.onTokenizeSuccess?.invoke(clientToken, error)
  }

  fun onResumeSuccess(clientToken: String?, error: PrimerErrorRN?) {
    if (implementedRNCallbacks?.isOnResumeSuccessImplemented == true) {
      this.onResumeSuccess?.invoke(clientToken, error)
    } else {
      sendError?.invoke(ErrorTypeRN.CheckoutFlowFailed
        errorTo "Callback [onResumeSuccess] should had been implemented.")
    }
  }

  fun removeCallbacksAndHandlers() {
    clientTokenCallback = null
    onClientSessionActions = null
    onTokenizeSuccess = null
    onResumeSuccess = null
  }

  fun setImplementedCallbacks(implementedRNCallbacks: PrimerImplementedRNCallbacks) {
    this.implementedRNCallbacks = implementedRNCallbacks
  }
}
