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

  private fun themeToString(t: UniversalCheckoutTheme?): String {
    if (t == null) {
      return "it's null :*("
    }
    var str = ""

    str += "{\n"
    str += "\tbuttonDefaultColor: ${t.buttonDefaultColor},\n"
    str += "\tinputBackgroundColor: ${t.inputBackgroundColor},\n"
    str += "\tbuttonPrimaryColor: ${t.buttonPrimaryColor},\n"
    str += "\ttextDangerColor: ${t.textDangerColor},\n"
    str += "\tbackgroundColor: ${t.backgroundColor},\n"
    str += "\tbuttonCornerRadius: ${t.buttonCornerRadius}\n"
    str += "}"

    return str
  }

  @ReactMethod
  fun initialize(serialized: String) {
    options.hydrate(serialized)

    Log.i("primer-rn", "Resolved theme")
    Log.i("primer-rn", themeToString(options?.theme))

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
