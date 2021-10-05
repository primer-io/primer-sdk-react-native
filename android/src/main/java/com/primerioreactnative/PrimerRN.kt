package com.primerioreactnative

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.primerioreactnative.datamodels.*
import io.primer.android.Primer
import io.primer.android.model.PrimerDebugOptions
import io.primer.android.model.dto.*
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json


class PrimerRN(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private var settings: PrimerSettingsRN = PrimerSettingsRN()
  private var theme: PrimerThemeRN = PrimerThemeRN()
  private var intent: PrimerIntentRN = PrimerIntentRN()

  private var mListener = PrimerRNEventListener()

  private var sdkWasInitialised = false
  private var haltExecution = false

  private val json = Json{ ignoreUnknownKeys = true }

  override fun getName(): String = "PrimerRN"

  @ReactMethod
  fun configureSettings(request: String) {
    try {
      Log.d("PrimerRN", "settings: $request")
      val settings = json.decodeFromString<PrimerSettingsRN>(request)
      this.settings = settings
    } catch (e: Exception) {
      Log.e("PrimerRN", "configure settings error: $e")
      val exception = PrimerErrorRN(
        ErrorTypeRN.ParseJsonFailed,
        "failed to parse settings.",
      )
      val encoded = json.encodeToString(exception)
      mListener.onPrimerErrorQueue?.addRequestAndPoll(encoded)
      haltExecution = true
    }
  }

  @ReactMethod
  fun configureTheme(request: String) {
    try {
      Log.d("PrimerRN", "theme: $request")
      val theme = json.decodeFromString<PrimerThemeRN>(request)
      this.theme = theme
    } catch (e: Exception) {
      Log.e("PrimerRN", "configure theme error: $e")
      val exception = PrimerErrorRN(
        ErrorTypeRN.ParseJsonFailed,
        "failed to parse theme.",
      )
      val encoded = json.encodeToString(exception)
      mListener.onPrimerErrorQueue?.addRequestAndPoll(encoded)
      haltExecution = true
    }
  }

  @ReactMethod
  fun configureIntent(request: String) {
    try {
      Log.d("PrimerRN", "intent: $request")
      val intent = json.decodeFromString<PrimerIntentRN>(request)
      this.intent = intent
    } catch (e: Exception) {
      Log.e("PrimerRN", "configure intent error: $e")
      val exception = PrimerErrorRN(
        ErrorTypeRN.ParseJsonFailed,
        "failed to parse intent.",
      )
      val encoded = json.encodeToString(exception)
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
  fun configureOnSavedPaymentInstrumentsFetched(callback: Callback) {
    mListener.configureOnSavedPaymentInstrumentsFetched(callback)
  }

  @ReactMethod
  fun dispose() {
    mListener = PrimerRNEventListener()
  }

  private fun startSdk(token: String) {
    val theme = this.theme.primerTheme
    val order = Order(
      currency = settings.order?.currency,
      amount = settings.order?.amount,
      countryCode = settings.order?.countryCode?.let { CountryCode.valueOf(it) },
    )

    val customer = Customer(
      firstName = "Carl",
      lastName = "Embarcadero",
      email = "carlEmbarcadero@mail.com",
      billingAddress = Address(
        line1 = "1 Some Street",
        city = "London",
        postalCode = "SW9 1NG",
        countryCode = CountryCode.GB,
      ),
    )
    val business = Business(name = "My Business")
    val options = Options(
      redirectScheme = settings.options?.android?.redirectScheme,
      is3DSOnVaultingEnabled = settings.options?.isThreeDsEnabled ?: false,
      debugOptions = PrimerDebugOptions(
        is3DSSanityCheckEnabled = false,
      ),
    )
    val settings = PrimerSettings(order, business, customer, options)
    val config = PrimerConfig(theme, settings)

    mListener.completion = { error ->
      currentActivity?.let {
        it.runOnUiThread {
          if (error) {
            Primer.instance.showError()
          } else {
            Primer.instance.showSuccess()
          }
        }
      }
    }

    Primer.instance.configure(config, mListener)
    sdkWasInitialised = true
  }

  @ReactMethod
  fun fetchSavedPaymentInstruments(token: String) {
    Log.d("PrimerRN", "fetch saved payment instruments")

    if (!sdkWasInitialised) startSdk(token)

    Primer.instance.fetchSavedPaymentInstruments(token)
  }

  @ReactMethod
  fun initialize(token: String) {
    try {
      if (haltExecution) {
        haltExecution = false
        return
      }
      Log.d("PrimerRN", "init with client token: $token")
      startSdk(token)
      val context = currentActivity as Context
      when (intent.vault) {
        false -> Primer.instance.showUniversalCheckout(context, token)
        true -> Primer.instance.showVaultManager(context, token)
      }
    } catch (e: Exception) {
      Log.e("PrimerRN", "init error: $e")
      val exception = PrimerErrorRN(
        ErrorTypeRN.InitFailed,
        "failed to initialise Primer SDK, error: $e",
      )
      val encoded = json.encodeToString(exception)
      mListener.onPrimerErrorQueue?.addRequestAndPoll(encoded)
    }
  }

  @ReactMethod
  fun resume(request: String) {
    try {
      val data = json.decodeFromString<PrimerResumeRequest>(request)
      mListener.completion?.invoke(data.error)
    } catch (e: Exception) {
      Log.e("PrimerRN", "configure settings error: $e")
      val exception = PrimerErrorRN(
        ErrorTypeRN.ParseJsonFailed,
        "failed to parse settings.",
      )
      val encoded = json.encodeToString(exception)
      mListener.onPrimerErrorQueue?.addRequestAndPoll(encoded)
      haltExecution = true
    }
  }
}
