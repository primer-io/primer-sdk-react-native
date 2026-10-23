package com.primerioreactnative.components.events

internal enum class PrimerHeadlessUniversalCheckoutRawDataManagerEvent(val eventName: String) {
    ON_METADATA_CHANGED("onMetadataChange"),
    ON_VALIDATION_CHANGED("onValidation"),
    ON_BIN_DATA_CHANGED("onBinDataChange"),
    ON_CARD_NETWORK_SYNC_CHANGED("onCardNetworkSyncChange"),
}
