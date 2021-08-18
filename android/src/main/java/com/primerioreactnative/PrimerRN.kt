package com.primerioreactnative

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.primerioreactnative.DataModels.*
import io.primer.android.CheckoutEventListener
import io.primer.android.UniversalCheckout
import io.primer.android.events.CheckoutEvent
import io.primer.android.model.dto.CountryCode
import io.primer.android.payment.card.Card
import io.primer.android.payment.klarna.Klarna
import io.primer.android.payment.paypal.PayPal
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import androidx.core.content.ContextCompat.startActivity

import android.content.Intent
import android.net.Uri
import io.primer.android.UniversalCheckoutTheme
import java.util.*


class PrimerRN(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private var settings: PrimerSettingsRN = PrimerSettingsRN()
  private var theme: PrimerThemeRN = PrimerThemeRN()
  private var flow: PrimerFlowRN = PrimerFlowRN()

  private val mListener = PrimerRNEventListener()

  override fun getName(): String = "PrimerRN"

  @ReactMethod
  fun configureSettings(request: String) {
    try {
      Log.d("PrimerRN", "settings: $request")
      val settings = Json.decodeFromString<PrimerSettingsRN>(request)
      this.settings = settings
    } catch (e: Exception) {
      Log.e("PrimerRN", "configure settings error: $e")
      mListener.onPrimerErrorQueue.addRequestAndPoll(PrimerExceptionRN.ParseJsonFailed.name)
    }
  }

  @ReactMethod
  fun configureTheme(request: String) {
    try {
      Log.d("PrimerRN", "theme: $request")
      val theme = Json.decodeFromString<PrimerThemeRN>(request)
      this.theme = theme
    } catch (e: Exception) {
      Log.e("PrimerRN", "configure theme error: $e")
      mListener.onPrimerErrorQueue.addRequestAndPoll(PrimerExceptionRN.ParseJsonFailed.name)
    }
  }

  @ReactMethod
  fun configureFlow(request: String) {
    try {
      Log.d("PrimerRN", "flow: $request")
      val flow = Json.decodeFromString<PrimerFlowRN>(request)
      this.flow = flow
    } catch (e: Exception) {
      Log.e("PrimerRN", "configure flow error: $e")
      mListener.onPrimerErrorQueue.addRequestAndPoll(PrimerExceptionRN.ParseJsonFailed.name)
    }
  }

  @ReactMethod
  fun configureOnTokenizeSuccess(callback: Callback) {
    mListener.configureOnTokenizeSuccess(callback)
  }

  @ReactMethod
  fun configureOnVaultSuccess(callback: Callback) {
    mListener.configureOnVaultSuccess(callback)
  }

  @ReactMethod
  fun configureOnDismiss(callback: Callback) {
    mListener.configureOnDismiss(callback)
  }

  @ReactMethod
  fun configureOnPrimerError(callback: Callback) {
    mListener.configureOnPrimerError(callback)
  }

  @ReactMethod
  fun dispose() {

  }

  @ReactMethod
  fun fetchSavedPaymentInstruments(callback: Callback) {
    Log.d("PrimerRN", "fetch saved payment instruments")
//    UniversalCheckout.getSavedPaymentMethods { data ->
//      try {
//        val paymentMethods = data.map { PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(it) }
//        val request = Json.encodeToString(paymentMethods)
//        callback.invoke(request)
//      } catch (e: Exception) {
//        Log.e("PrimerRN", "fetch saved payment methods error: $e")
//        mListener.onPrimerErrorQueue.addRequestAndPoll(PrimerExceptionRN.ParseJsonFailed.name)
//      }
//    }
  }

  @ReactMethod
  fun init(token: String) {
    try {
      Log.d("PrimerRN", "init with client token: $token")

      val theme = this.theme.primerTheme

      val context = currentActivity as Context
      UniversalCheckout.initialize(
        context,
        token,
        countryCode = CountryCode.GB,
        locale = Locale.UK,
        theme = theme,
      )
      val paymentMethods = flow.toPaymentMethods()
      UniversalCheckout.loadPaymentMethods(paymentMethods)

      mListener.completion = {
        currentActivity?.let {
          it.runOnUiThread {
            UniversalCheckout.showSuccess(5000)
          }
        }
      }

      when (flow.intent) {
        PrimerIntentRN.Checkout -> UniversalCheckout.showCheckout(
          context,
          mListener,
          isStandalonePaymentMethod = false,
          doNotShowUi = settings.options?.isInitialLoadingHidden ?: false,
          preferWebView = true,
          currency = settings.order?.currency,
          amount = settings.order?.amount,
          clearAllListeners = true,
          webBrowserRedirectScheme = settings.options?.androidRedirectScheme,
        )
        PrimerIntentRN.Vault -> UniversalCheckout.showVault(
          context,
          mListener,
          isStandalonePaymentMethod = false,
          doNotShowUi = settings.options?.isInitialLoadingHidden ?: false,
          preferWebView = true,
          currency = settings.order?.currency,
          amount = settings.order?.amount,
          clearAllListeners = true,
          webBrowserRedirectScheme = settings.options?.androidRedirectScheme,
        )
      }
    } catch (e: Exception) {
      Log.e("PrimerRN", "init error: $e")
      mListener.onPrimerErrorQueue.addRequestAndPoll(PrimerExceptionRN.InitFailed.name)
    }
  }

  @ReactMethod
  fun resume(request: String) {
    mListener.completion?.invoke()
  }
}
