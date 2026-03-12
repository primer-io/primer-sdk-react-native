package com.primerioreactnative.components.manager.raw

import com.primerioreactnative.components.events.PrimerHeadlessUniversalCheckoutRawDataManagerEvent
import com.primerioreactnative.datamodels.PrimerInputValidationErrorRN
import io.primer.android.components.domain.core.models.card.PrimerBinData
import io.primer.android.components.domain.core.models.card.PrimerCardBinData
import io.primer.android.components.domain.core.models.card.PrimerCardMetadata
import io.primer.android.components.domain.core.models.metadata.PrimerPaymentMethodBinData
import io.primer.android.components.domain.core.models.metadata.PrimerPaymentMethodMetadata
import io.primer.android.components.domain.error.PrimerInputValidationError
import io.primer.android.components.manager.raw.PrimerHeadlessUniversalCheckoutRawDataManagerListener
import io.primer.android.core.ExperimentalPrimerApi
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject

@ExperimentalPrimerApi
internal class PrimerRNHeadlessUniversalCheckoutRawManagerListener :
    PrimerHeadlessUniversalCheckoutRawDataManagerListener {
    var sendEvent: ((eventName: String, paramsJson: JSONObject?) -> Unit)? = null

    override fun onValidationChanged(
        isValid: Boolean,
        errors: List<PrimerInputValidationError>,
    ) {
        sendEvent?.invoke(
            PrimerHeadlessUniversalCheckoutRawDataManagerEvent.ON_VALIDATION_CHANGED.eventName,
            JSONObject().apply {
                put("isValid", isValid)
                put(
                    "errors",
                    JSONArray(
                        errors.map {
                            JSONObject(
                                Json.encodeToString(
                                    PrimerInputValidationErrorRN(
                                        it.errorId,
                                        it.description,
                                        it.inputElementType.name,
                                        it.diagnosticsId,
                                    ),
                                ),
                            )
                        },
                    ),
                )
            },
        )
    }

    override fun onMetadataChanged(metadata: PrimerPaymentMethodMetadata) {
        sendEvent?.invoke(
            PrimerHeadlessUniversalCheckoutRawDataManagerEvent.ON_METADATA_CHANGED.eventName,
            JSONObject().apply {
                if (metadata is PrimerCardMetadata) {
                    put("cardNetwork", metadata.cardNetwork.name)
                }
            },
        )
    }

    override fun onBinDataAvailable(binData: PrimerPaymentMethodBinData) {
        if (binData is PrimerBinData) {
            sendEvent?.invoke(
                PrimerHeadlessUniversalCheckoutRawDataManagerEvent.ON_BIN_DATA_CHANGED.eventName,
                JSONObject().apply {
                    put("preferred", binData.preferred?.toJsonObject() ?: JSONObject.NULL)
                    put("alternatives", JSONArray(binData.alternatives.map { it.toJsonObject() }))
                    put("status", binData.status.name)
                    put("firstDigits", binData.firstDigits ?: JSONObject.NULL)
                },
            )
        }
    }

    private fun PrimerCardBinData.toJsonObject(): JSONObject {
        return JSONObject().apply {
            put("network", network)
            put("displayName", displayName)
            put("issuerCountryCode", issuerCountryCode)
            put("issuerName", issuerName)
            put("accountFundingType", accountFundingType)
            put("prepaidReloadableIndicator", prepaidReloadableIndicator)
            put("productUsageType", productUsageType)
            put("productCode", productCode)
            put("productName", productName)
            put("issuerCurrencyCode", issuerCurrencyCode)
            put("regionalRestriction", regionalRestriction)
            put("accountNumberType", accountNumberType)
        }
    }
}
