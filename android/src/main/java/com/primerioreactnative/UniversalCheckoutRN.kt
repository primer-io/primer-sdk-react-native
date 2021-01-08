package com.primerioreactnative

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.*
import io.primer.android.IClientTokenProvider
import io.primer.android.PaymentMethod
import io.primer.android.UniversalCheckout
import io.primer.android.events.CheckoutEvent

class UniversalCheckoutRN(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private var callback: Callback? = null
  private val listener = object : UniversalCheckout.EventListener {
    override fun onCheckoutEvent(e: CheckoutEvent) {
      callback?.invoke(e)
    }
  }

  override fun getName(): String {
      return "UniversalCheckout"
  }

  @ReactMethod
  fun initialize(clientToken: String) {
    UniversalCheckout.initialize(currentActivity as Context, object : IClientTokenProvider {
      override fun createToken(callback: (String) -> Unit) {
        callback(clientToken)
      }
    })
  }

  @ReactMethod
  fun loadPaymentMethods(serialized: String) {
    Log.i("primer-rn", serialized)

    UniversalCheckout.loadPaymentMethods(
      listOf(PaymentMethod.Card())
//      PaymentMethodDeserializer(paymentMethods).deserialize()
    )
  }

  @ReactMethod
  fun dismiss() {
    UniversalCheckout.dismiss()
  }

  @ReactMethod
  fun showSuccess(serialized: String) {
    val delay: Int = OptionsDeserializer(serialized).get("dismissDelay", 3000)
    UniversalCheckout.showSuccess(dismissDelay = delay)
  }

  @ReactMethod
  fun show(serialized: String, cb: Callback) {
    callback = cb

    val options = OptionsDeserializer(serialized)

    UniversalCheckout.show(
      listener,
      uxMode = intToUxMode(options.get("uxMode")),
      currency = options.get("currency"),
      amount = options.get("amount")
    )
  }

  @ReactMethod
  fun destroy() {
    UniversalCheckout.destroy()
    callback = null
  }

  private fun intToUxMode(ordinal: Int?): UniversalCheckout.UXMode? {
    return when(ordinal) {
      0 -> UniversalCheckout.UXMode.CHECKOUT
      1 -> UniversalCheckout.UXMode.ADD_PAYMENT_METHOD
      else -> null
    }
  }
}
