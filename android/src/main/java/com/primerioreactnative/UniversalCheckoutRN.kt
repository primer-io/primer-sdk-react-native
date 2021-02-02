package com.primerioreactnative

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import io.primer.android.UniversalCheckout
import io.primer.android.UniversalCheckoutTheme

class UniversalCheckoutRN(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private val mListener = CheckoutEventListener()
  private val options = ModuleOptions()

  override fun getName(): String {
    return "UniversalCheckout"
  }

  @ReactMethod
  fun setEventCallback(cb: Callback) {
    mListener.poll(cb)
  }

  @ReactMethod
  fun initialize(serialized: String) {
    options.hydrate(serialized)

    val context = currentActivity as Context
    val provider = CheckoutClientTokenProvider(options.clientToken)

    UniversalCheckout.initialize(context, provider, theme = options.theme)
    UniversalCheckout.loadPaymentMethods(options.paymentMethods)
  }

  @ReactMethod
  fun dismiss() {
    UniversalCheckout.dismiss()
  }

  @ReactMethod
  fun showSuccess() {
    UniversalCheckout.showSuccess(autoDismissDelay = options.autoDismissDelay)
  }

  @ReactMethod
  fun show() {
    when (options.uxMode) {
      0 -> UniversalCheckout.showCheckout(mListener, amount = options.amount!!, currency = options.currency!!)
      1 -> UniversalCheckout.showSavedPaymentMethods(mListener)
      2 -> UniversalCheckout.showStandalone(mListener, paymentMethod = options.paymentMethods.first())
      else -> {
      }
    }
  }

  @ReactMethod
  fun destroy() {
    UniversalCheckout.destroy()
    mListener.clear()
  }
}
