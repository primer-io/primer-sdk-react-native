package com.primerioreactnative

import android.util.Log
import com.facebook.react.bridge.Callback
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.PrimerErrorRN
import com.primerioreactnative.datamodels.PrimerOnClientSessionActionsRequestRN
import com.primerioreactnative.datamodels.PrimerPaymentInstrumentTokenRN
import com.primerioreactnative.utils.PrimerEventQueueRN
import io.primer.android.CheckoutEventListener
import io.primer.android.completion.ActionResumeHandler
import io.primer.android.completion.ResumeHandler
import io.primer.android.events.CheckoutEvent
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class PrimerRNEventListener : CheckoutEventListener {

  private var onTokenizeSuccessQueue: PrimerEventQueueRN? = null
  private var onClientSessionActionsQueue: PrimerEventQueueRN? = null
  private var onResumeSuccessQueue: PrimerEventQueueRN? = null
  private var onVaultSuccessQueue: PrimerEventQueueRN? = null
  private var onDismissQueue: PrimerEventQueueRN? = null
  var onPrimerErrorQueue: PrimerEventQueueRN? = null
  var onSavedPaymentInstrumentsFetchedQueue: PrimerEventQueueRN? = null

  var completion: ((error: String?, token: String?) -> Unit)? = null
  var actionCompletion: ((error: Boolean, token: String?) -> Unit)? = null

  var resumeHandler: ResumeHandler? = null
  var actionResumeHandler: ActionResumeHandler? = null

  fun configureOnTokenizeSuccess(callback: Callback) {
    onTokenizeSuccessQueue = PrimerEventQueueRN()
    onTokenizeSuccessQueue?.poll(callback)
  }

  fun configureOnClientSessionActions(callback: Callback) {
    onClientSessionActionsQueue = PrimerEventQueueRN()
    println("polling with callback: $callback")
    onClientSessionActionsQueue?.poll(callback)
  }

  fun configureOnResumeSuccess(callback: Callback) {
    onResumeSuccessQueue = PrimerEventQueueRN()
    onResumeSuccessQueue?.poll(callback)
  }

  fun configureOnVaultSuccess(callback: Callback) {
    onVaultSuccessQueue = PrimerEventQueueRN()
    onVaultSuccessQueue?.poll(callback)
  }

  fun configureOnDismiss(callback: Callback) {
    onDismissQueue = PrimerEventQueueRN()
    onDismissQueue?.poll(callback)
  }

  fun configureOnPrimerError(callback: Callback) {
    onPrimerErrorQueue = PrimerEventQueueRN()
    onPrimerErrorQueue?.poll(callback)
  }

  fun configureOnSavedPaymentInstrumentsFetched(callback: Callback) {
    onSavedPaymentInstrumentsFetchedQueue = PrimerEventQueueRN()
    onSavedPaymentInstrumentsFetchedQueue?.poll(callback)
  }

  override fun onClientSessionActions(event: CheckoutEvent.OnClientSessionActions) {
    val token = PrimerOnClientSessionActionsRequestRN.build(event.data)
    val request = Json.encodeToString(token)

    println("on client session actions")
    println("onClientSessionActionsQueue is null?: ${onClientSessionActionsQueue == null}")

    onClientSessionActionsQueue?.addRequestAndPoll(request)
    actionResumeHandler = event.resumeHandler
  }

  override fun onCheckoutEvent(e: CheckoutEvent) {
    when (e) {
      is CheckoutEvent.TokenAddedToVault -> {
        val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(e.data)
        val request = Json.encodeToString(token)
        onVaultSuccessQueue?.addRequestAndPoll(request)
      }
      is CheckoutEvent.TokenizationSuccess -> {
        val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(e.data)
        val request = Json.encodeToString(token)
        onTokenizeSuccessQueue?.addRequestAndPoll(request)
        resumeHandler = e.resumeHandler
      }
      is CheckoutEvent.TokenSelected -> {
        val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(e.data)
        val request = Json.encodeToString(token)
        onTokenizeSuccessQueue?.addRequestAndPoll(request)
      }
      is CheckoutEvent.ResumeSuccess -> {
        val token = e.resumeToken
        onResumeSuccessQueue?.addRequestAndPoll(token)
        resumeHandler = e.resumeHandler
      }
      is CheckoutEvent.SavedPaymentInstrumentsFetched -> {
        val list = e.data.map { PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(it) }
        val request = Json.encodeToString(list)
        onSavedPaymentInstrumentsFetchedQueue?.addRequestAndPoll(request)
      }
      is CheckoutEvent.Exit -> {
        onDismissQueue?.addRequestAndPoll("dismiss")
        onDismissQueue = null
      }
      is CheckoutEvent.ApiError -> {
        Log.e("PrimerRN", "ApiError: ${e.data}")
        val exception = PrimerErrorRN(
          ErrorTypeRN.CheckoutFlowFailed,
          e.data.description,
        )
        val data = Json.encodeToString(exception)
        onPrimerErrorQueue?.addRequestAndPoll(data)
      }
      is CheckoutEvent.TokenizationError -> {
        Log.e("PrimerRN", "TokenizationError: ${e.data}")
        val exception = PrimerErrorRN(
          ErrorTypeRN.TokenizationFailed,
          e.data.description,
        )
        val data = Json.encodeToString(exception)
        onPrimerErrorQueue?.addRequestAndPoll(data)
      }
      else -> Unit
    }
  }
}
