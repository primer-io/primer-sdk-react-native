package com.primerioreactnative

import android.util.Log
import androidx.annotation.MainThread
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactMethod
import com.primerioreactnative.DataModels.PrimerPaymentInstrumentTokenRN
import com.primerioreactnative.Utils.PrimerEventQueueRN
import io.primer.android.CheckoutEventListener
import io.primer.android.UniversalCheckout
import io.primer.android.events.CheckoutEvent
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.*

class PrimerRNEventListener(
  private val onTokenizeSuccessQueue: PrimerEventQueueRN = PrimerEventQueueRN(),
  private val onVaultSuccessQueue: PrimerEventQueueRN = PrimerEventQueueRN(),
  private val onDismissQueue: PrimerEventQueueRN = PrimerEventQueueRN(),
  val onPrimerErrorQueue: PrimerEventQueueRN = PrimerEventQueueRN(),
): CheckoutEventListener {

  var completion: (() -> Unit)? = null

  fun configureOnTokenizeSuccess(callback: Callback) {
    onTokenizeSuccessQueue.poll(callback)
  }

  fun configureOnVaultSuccess(callback: Callback) {
    onVaultSuccessQueue.poll(callback)
  }

  fun configureOnDismiss(callback: Callback) {
    onDismissQueue.poll(callback)
  }

  fun configureOnPrimerError(callback: Callback) {
    onPrimerErrorQueue.poll(callback)
  }

  override fun onCheckoutEvent(e: CheckoutEvent) {
    when (e) {
      is CheckoutEvent.TokenAddedToVault -> {
        val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(e.data)
        val request = Json.encodeToString(token)
        onVaultSuccessQueue.addRequestAndPoll(request)
      }
      is CheckoutEvent.TokenizationSuccess -> {
        val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(e.data)
        val request = Json.encodeToString(token)
        onTokenizeSuccessQueue.addRequestAndPoll(request)
      }
      is CheckoutEvent.TokenizationError -> {
        Log.e("PrimerRN", "TokenizationError: ${e.data}")
//          val data = Json.encodeToString(e.data)
//          onPrimerErrorCallback?.invoke(data)
      }
      is CheckoutEvent.TokenSelected -> {
        val token = PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(e.data)
        val request = Json.encodeToString(token)
        onTokenizeSuccessQueue.addRequestAndPoll(request)
      }
      is CheckoutEvent.Exit -> {
        onDismissQueue.addRequestAndPoll("dismiss")
      }
      is CheckoutEvent.ApiError -> {
        Log.e("PrimerRN", "ApiError: ${e.data}")
//        val data = Json.encodeToString(e.data)
//        onPrimerErrorCallback?.invoke(data)
      }
      else -> Unit
    }
  }
}
