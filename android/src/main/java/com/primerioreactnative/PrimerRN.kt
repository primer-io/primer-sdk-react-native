package com.primerioreactnative

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.primerioreactnative.datamodels.*
import io.primer.android.UniversalCheckout
import io.primer.android.UniversalCheckoutTheme
import io.primer.android.model.dto.CountryCode
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

import java.util.*


class PrimerRN(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private var settings: PrimerSettingsRN = PrimerSettingsRN()
  private var theme: PrimerThemeRN = PrimerThemeRN()
  private var intent: PrimerIntentRN = PrimerIntentRN()

  private var mListener = PrimerRNEventListener()

  private var sdkWasInitialised = false
  private var haltExecution = false

  override fun getName(): String = "PrimerRN"

  @ReactMethod
  fun configureSettings(request: String) {
    try {
      Log.d("PrimerRN", "settings: $request")
      val settings = Json.decodeFromString<PrimerSettingsRN>(request)
      this.settings = settings
    } catch (e: Exception) {
      Log.e("PrimerRN", "configure settings error: $e")
      val exception = PrimerExceptionRN(
        ExceptionTypeRN.ParseJsonFailed,
        "failed to parse settings.",
      )
      val encoded = Json.encodeToString(exception)
      mListener.onPrimerErrorQueue?.addRequestAndPoll(encoded)
      haltExecution = true
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
      val exception = PrimerExceptionRN(
        ExceptionTypeRN.ParseJsonFailed,
        "failed to parse theme.",
      )
      val encoded = Json.encodeToString(exception)
      mListener.onPrimerErrorQueue?.addRequestAndPoll(encoded)
      haltExecution = true
    }
  }

  @ReactMethod
  fun configureIntent(request: String) {
    try {
      Log.d("PrimerRN", "intent: $request")
      val intent = Json.decodeFromString<PrimerIntentRN>(request)
      this.intent = intent
    } catch (e: Exception) {
      Log.e("PrimerRN", "configure intent error: $e")
      val exception = PrimerExceptionRN(
        ExceptionTypeRN.ParseJsonFailed,
        "failed to parse intent.",
      )
      val encoded = Json.encodeToString(exception)
      mListener.onPrimerErrorQueue?.addRequestAndPoll(encoded)
      haltExecution = true
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
    mListener = PrimerRNEventListener()
  }

  private fun startSdk(token: String) {
    val context = currentActivity as Context
    val theme = this.theme.primerTheme
    UniversalCheckout.initialize(context, token, theme = theme)
    sdkWasInitialised = true
  }

  @ReactMethod
  fun fetchSavedPaymentInstruments(token: String, callback: Callback) {
    Log.d("PrimerRN", "fetch saved payment instruments")

    if (!sdkWasInitialised) startSdk(token)

    UniversalCheckout.getSavedPaymentMethods { data ->
      try {
        val paymentMethods = data.map { PrimerPaymentInstrumentTokenRN.fromPaymentMethodToken(it) }
        val request = Json.encodeToString(paymentMethods)
        callback.invoke(request)
      } catch (e: Exception) {
        Log.e("PrimerRN", "fetch saved payment methods error: $e")
        val exception = PrimerExceptionRN(
          ExceptionTypeRN.ParseJsonFailed,
          "failed to parse fetched payment methods.",
        )
        val encoded = Json.encodeToString(exception)
        mListener.onPrimerErrorQueue?.addRequestAndPoll(encoded)
        haltExecution = true
      }
    }
  }

  @ReactMethod
  fun initialize(token: String) {
    try {

      if (haltExecution) {
        haltExecution = false
        return
      }

      Log.d("PrimerRN", "init with client token: $token")

      val theme = this.theme.primerTheme

      val context = currentActivity as Context

      startSdk(token)

      val paymentMethods = intent.toPaymentMethods(settings)
      UniversalCheckout.loadPaymentMethods(paymentMethods)

      mListener.completion = {
        currentActivity?.let {
          it.runOnUiThread {
            UniversalCheckout.dismiss(true)
          }
        }
      }

      when (intent.vault) {
        false -> UniversalCheckout.showCheckout(
          context,
          mListener,
          isStandalonePaymentMethod = paymentMethods.size < 2,
          doNotShowUi = settings.options?.isInitialLoadingHidden ?: false,
          preferWebView = true,
          currency = settings.order?.currency,
          amount = settings.order?.amount,
          clearAllListeners = true,
          webBrowserRedirectScheme = settings.options?.androidRedirectScheme,
        )
        true -> UniversalCheckout.showVault(
          context,
          mListener,
          isStandalonePaymentMethod = paymentMethods.size < 2,
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
      val exception = PrimerExceptionRN(
        ExceptionTypeRN.InitFailed,
        "failed to initialise Primer SDK, error: $e",
      )
      val encoded = Json.encodeToString(exception)
      mListener.onPrimerErrorQueue?.addRequestAndPoll(encoded)
    }
  }

  @ReactMethod
  fun resume(request: String) {
    mListener.completion?.invoke()
  }
}
