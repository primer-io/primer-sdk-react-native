package com.primerioreactnative

import android.util.Log
import com.facebook.react.bridge.Callback
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.PrimerErrorRN
import com.primerioreactnative.datamodels.PrimerPaymentInstrumentTokenRN
import com.primerioreactnative.utils.PrimerEventQueueRN
import io.primer.android.CheckoutEventListener
import io.primer.android.Primer
import io.primer.android.events.CheckoutEvent
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class PrimerRNEventListener : CheckoutEventListener {

  private var onTokenizeSuccessQueue: PrimerEventQueueRN? = null
  private var onVaultSuccessQueue: PrimerEventQueueRN? = null
  private var onDismissQueue: PrimerEventQueueRN? = null
  var onPrimerErrorQueue: PrimerEventQueueRN? = null
  var onSavedPaymentInstrumentsFetchedQueue: PrimerEventQueueRN? = null

  var completion: ((error: Boolean) -> Unit)? = null

  fun configureOnTokenizeSuccess(callback: Callback) {
    onTokenizeSuccessQueue = PrimerEventQueueRN()
    onTokenizeSuccessQueue?.poll(callback)
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
      }
      is CheckoutEvent.TokenSelected -> {
        val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(e.data)
        val request = Json.encodeToString(token)
        onTokenizeSuccessQueue?.addRequestAndPoll(request)
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
