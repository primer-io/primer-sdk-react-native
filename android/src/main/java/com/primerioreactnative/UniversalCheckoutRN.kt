package com.primerioreactnative

import android.content.Context
import com.facebook.react.bridge.*
import io.primer.android.ClientTokenProvider
import io.primer.android.PaymentMethod
import io.primer.android.UniversalCheckout
import io.primer.android.events.CheckoutEvent
import io.primer.android.model.dto.PaymentMethodToken
import org.json.JSONArray
import org.json.JSONObject
import java.util.*
import kotlin.collections.ArrayList

class UniversalCheckoutRN(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private var options: OptionsDeserializer? = null
  private var paymentMethods: MutableList<PaymentMethod> = ArrayList()

  private val listener = object : UniversalCheckout.EventListener {
    private var mQueue: Deque<CheckoutEvent> = ArrayDeque()
    private var mCallback: Callback? = null

    override fun onCheckoutEvent(e: CheckoutEvent) {
      mQueue.add(e)
      poll()
    }

    fun poll(cb: Callback? = null) {
      if (cb != null) {
        mCallback = cb
      }

      mCallback?.let { callback ->
        mQueue.poll()?.let { next ->
          callback.invoke(serializeEvent(next))
          mCallback = null
        }
      }
    }

    fun clear() {
      mQueue.clear()
      mCallback = null
    }
  }

  override fun getName(): String {
      return "UniversalCheckout"
  }

  @ReactMethod
  fun setEventCallback(cb: Callback) {
    listener.poll(cb)
  }

  @ReactMethod
  fun initialize(serialized: String) {
    options = OptionsDeserializer(serialized)
    paymentMethods = PaymentMethodDeserializer(options!!.get("paymentMethods", JSONArray())).deserialize()

    UniversalCheckout.initialize(
      currentActivity as Context,
      object : ClientTokenProvider {
        override fun createToken(callback: (String) -> Unit) {
          options?.get<String>("clientToken")?.let { callback(it) }
        }
      }
    )

    UniversalCheckout.loadPaymentMethods(paymentMethods)
  }

  @ReactMethod
  fun dismiss() {
    UniversalCheckout.dismiss()
  }

  @ReactMethod
  fun showSuccess() {
    val delay: Int = options?.get("autoDismissDelay", 3000) ?: 3000
    UniversalCheckout.showSuccess(autoDismissDelay = delay)
  }

  @ReactMethod
  fun show() {
    when (options?.get("uxMode") ?: 0) {
      0 -> UniversalCheckout.showCheckout(listener, amount = options!!.get("amount")!!, currency = options!!.get("currency")!!)
      1 -> UniversalCheckout.showSavedPaymentMethods(listener)
      2 -> UniversalCheckout.showStandalone(listener, paymentMethod = paymentMethods.first())
      else -> {}
    }
  }

  @ReactMethod
  fun destroy() {
    UniversalCheckout.destroy()
    options = null
    listener.clear()
  }

  private fun serializeEvent(e: CheckoutEvent): String {
    val json = JSONObject()
    json.put("type", e.type.name)

    val data = when(e) {
      is CheckoutEvent.Exit -> JSONObject().apply {
        put("reason", e.data.reason.name)
      }
      is CheckoutEvent.TokenAddedToVault -> serializeToken(e.data)
      is CheckoutEvent.TokenizationSuccess -> serializeToken(e.data)
      is CheckoutEvent.TokenRemovedFromVault -> serializeToken(e.data)
      is CheckoutEvent.TokenizationError -> JSONObject().apply {
        put("errorId", e.data.errorId ?: "")
        put("diagnosticsId", e.data.diagnosticsId ?: "")
        put("message", e.data.description)
      }
      else -> JSONObject()
    }

    json.put("data", data)

    return json.toString()
  }

  private fun serializeToken(data: PaymentMethodToken): JSONObject {
    return JSONObject().apply {
      put("token", data.token)
      put("analyticsId", data.analyticsId)
      put("paymentInstrumentType", data.paymentInstrumentType)
      put("paymentInstrumentData", data.paymentInstrumentData.toString())
      data.vaultData?.let {
        put("vaultData", JSONObject().apply {
          put("customerId", it.customerId)
        })
      }
    }
  }
}
