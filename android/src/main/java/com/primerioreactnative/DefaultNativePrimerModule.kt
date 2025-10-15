package com.primerioreactnative

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.primerioreactnative.datamodels.ErrorTypeRN
import com.primerioreactnative.datamodels.PrimerCheckoutDataRN
import com.primerioreactnative.datamodels.PrimerErrorRN
import com.primerioreactnative.datamodels.PrimerEvents
import com.primerioreactnative.datamodels.PrimerSettingsRN
import com.primerioreactnative.datamodels.toPrimerSettings
import com.primerioreactnative.utils.PrimerImplementedRNCallbacks
import com.primerioreactnative.utils.errorTo
import com.primerioreactnative.utils.toWritableMap
import io.primer.android.Primer
import io.primer.android.PrimerSessionIntent
import io.primer.android.data.settings.PrimerSettings
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

@Suppress("TooManyFunctions")
internal open class DefaultNativePrimerModule(
    private val reactContext: ReactApplicationContext,
    private val json: Json,
    private val eventSender: (String, WritableMap) -> Unit,
) {
    private val mListener = PrimerRNEventListener()

    init {
        mListener.sendEvent = { eventName, paramsJson -> sendEvent(eventName, paramsJson) }
        mListener.sendError = { paramsJson -> onError(paramsJson) }
        mListener.sendErrorWithCheckoutData = { paramsJson, checkoutData -> onError(paramsJson, checkoutData) }
        mListener.onDismissedEvent = { Primer.instance.dismiss(true) }
    }

    open fun sendEvent(
        name: String,
        params: WritableMap,
    ) = eventSender(name, params)

    open fun sendEvent(
        name: String,
        data: JSONObject?,
    ) = eventSender(name, prepareData(data))

    fun getName(): String {
        return NAME
    }

    fun configure(
        settingsStr: String?,
        promise: Promise,
    ) {
        try {
            val settings = if (settingsStr.isNullOrBlank()) {
                PrimerSettingsRN()
            } else {
                json.decodeFromString(
                    settingsStr,
                )
            }
            startSdk(settings.toPrimerSettings(reactContext))
            promise.resolve(null)
        } catch (expected: Exception) {
            Log.e("PrimerRN", "configure settings error: $expected")
            val exception = ErrorTypeRN.NativeBridgeFailed errorTo "failed to parse settings."
            onError(exception)
            promise.reject(exception.errorId, exception.description, expected)
        }
    }

    fun showUniversalCheckoutWithClientToken(
        clientToken: String,
        promise: Promise,
    ) {
        try {
            Primer.instance.showUniversalCheckout(
                reactContext.applicationContext,
                clientToken,
            )
            promise.resolve(null)
        } catch (expected: Exception) {
            val exception = ErrorTypeRN.NativeBridgeFailed errorTo "Primer SDK failed: ${expected.message}"
            onError(exception)
            promise.reject(exception.errorId, exception.description, expected)
        }
    }

    fun showVaultManagerWithClientToken(
        clientToken: String,
        promise: Promise,
    ) {
        try {
            Primer.instance.showVaultManager(
                reactContext.applicationContext,
                clientToken,
            )
            promise.resolve(null)
        } catch (expected: Exception) {
            val exception = ErrorTypeRN.NativeBridgeFailed errorTo "Primer SDK failed: ${expected.message}"
            onError(exception)
            promise.reject(exception.errorId, exception.description, expected)
        }
    }

    fun showPaymentMethod(
        paymentMethod: String,
        intent: String,
        clientToken: String,
        promise: Promise,
    ) {
        try {
            if (PrimerSessionIntent.entries.firstOrNull { intent.equals(it.name, true) } == null) {
                val exception = PrimerErrorRN(
                    errorId = ErrorTypeRN.NativeBridgeFailed.errorId,
                    errorCode = null,
                    description = "Invalid value for 'intent'.",
                    diagnosticsId = null,
                    recoverySuggestion = "'intent' can be 'CHECKOUT' or 'VAULT'.",
                )
                promise.reject(exception.errorId, exception.description)
            } else {
                Primer.instance.showPaymentMethod(
                    reactContext.applicationContext,
                    clientToken,
                    paymentMethod,
                    PrimerSessionIntent.entries.first {
                        intent.equals(it.name, ignoreCase = true)
                    },
                )
                promise.resolve(null)
            }
        } catch (expected: Exception) {
            val exception = ErrorTypeRN.NativeBridgeFailed errorTo "Primer SDK failed: ${expected.message}"
            onError(exception)
            promise.reject(exception.errorId, exception.description, expected)
        }
    }

    fun dismiss(promise: Promise) {
        Primer.instance.dismiss(true)
        promise.resolve(null)
    }

    fun cleanUp(promise: Promise) {
        Primer.instance.dismiss(true)
        promise.resolve(null)
    }

    // region tokenization handlers
    fun handleTokenizationNewClientToken(
        newClientToken: String,
        promise: Promise,
    ) {
        mListener.handleTokenizationNewClientToken(newClientToken)
        promise.resolve(null)
    }

    fun handleTokenizationSuccess(promise: Promise) {
        mListener.handleTokenizationSuccess()
        promise.resolve(null)
    }

    fun handleTokenizationFailure(
        errorMessage: String?,
        promise: Promise,
    ) {
        mListener.handleTokenizationFailure(errorMessage.orEmpty())
        promise.resolve(null)
    }
    // endregion

    // region resume handlers
    fun handleResumeWithNewClientToken(
        newClientToken: String,
        promise: Promise,
    ) {
        mListener.handleResumeNewClientToken(newClientToken)
        promise.resolve(null)
    }

    fun handleResumeSuccess(promise: Promise) {
        mListener.handleResumeSuccess()
        promise.resolve(null)
    }

    fun handleResumeFailure(
        errorMessage: String?,
        promise: Promise,
    ) {
        mListener.handleResumeFailure(errorMessage.orEmpty())
        promise.resolve(null)
    }
    // endregion

    // region payment handlers
    fun handlePaymentCreationContinue(promise: Promise) {
        mListener.handlePaymentCreationContinue()
        promise.resolve(null)
    }

    fun handlePaymentCreationAbort(
        errorMessage: String?,
        promise: Promise,
    ) {
        mListener.handlePaymentCreationAbort(errorMessage.orEmpty())
        promise.resolve(null)
    }
    // endregion

    // region error handlers
    fun showErrorMessage(
        errorMessage: String?,
        promise: Promise,
    ) {
        mListener.handleErrorMessage(errorMessage.orEmpty())
        promise.resolve(null)
    }
    // endregion

    fun setImplementedRNCallbacks(
        implementedRNCallbacksStr: String,
        promise: Promise,
    ) {
        try {
            Log.d("PrimerRN", "implementedRNCallbacks: $implementedRNCallbacksStr")
            val implementedRNCallbacks = json.decodeFromString<PrimerImplementedRNCallbacks>(implementedRNCallbacksStr)
            this.mListener.setImplementedCallbacks(implementedRNCallbacks)
            promise.resolve(null)
        } catch (expected: Exception) {
            val exception =
                ErrorTypeRN.NativeBridgeFailed errorTo "Implemented callbacks $implementedRNCallbacksStr is not valid."
            onError(exception)
            promise.reject(exception.errorId, exception.description, expected)
        }
    }

    private fun startSdk(settings: PrimerSettings) {
        Primer.instance.configure(settings, mListener)
    }

    private fun onError(
        exception: PrimerErrorRN,
        checkoutDataRN: PrimerCheckoutDataRN? = null,
    ) {
        val params = Arguments.createMap()
        val errorJson = JSONObject(Json.encodeToString(exception))
        val errorData = prepareData(errorJson)
        params.putMap(Keys.ERROR, errorData)
        checkoutDataRN?.let {
            val checkoutDataJson = JSONObject(Json.encodeToString(it))
            val checkoutData = prepareData(checkoutDataJson)
            params.putMap(Keys.CHECKOUT_DATA, checkoutData)
        }
        sendEvent(PrimerEvents.ON_ERROR.eventName, params)
    }

    private fun prepareData(data: JSONObject?): WritableMap {
        return data.toWritableMap()
    }

    companion object Companion {
        const val NAME = "NativePrimer"
    }
}

internal object Keys {
    const val ERROR = "error"
    const val RESUME_TOKEN = "resumeToken"
    const val CHECKOUT_DATA = "checkoutData"
    const val ADDITIONAL_INFO = "additionalInfo"
}
