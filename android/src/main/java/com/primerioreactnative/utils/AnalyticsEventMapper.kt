package com.primerioreactnative.utils

import io.primer.android.components.analytics.data.model.AnalyticsEvent

@Suppress("CyclomaticComplexMethod", "ReturnCount", "LongMethod")
internal fun toAnalyticsEvent(name: String, metadata: Map<String, String>?): AnalyticsEvent? {
    return when (name) {
        "SDK_INIT_START" -> AnalyticsEvent.SdkInitStart
        "SDK_INIT_END" -> AnalyticsEvent.SdkInitEnd
        "CHECKOUT_FLOW_STARTED" -> AnalyticsEvent.CheckoutFlowStarted
        "PAYMENT_FLOW_EXITED" -> AnalyticsEvent.PaymentFlowExited
        "PAYMENT_REATTEMPTED" -> AnalyticsEvent.PaymentReattempted(metadata?.get("paymentMethod"))

        "PAYMENT_METHOD_SELECTION" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            AnalyticsEvent.PaymentMethodSelection(paymentMethod)
        }
        "PAYMENT_DETAILS_ENTERED" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            AnalyticsEvent.PaymentDetailsEntered(paymentMethod)
        }
        "PAYMENT_SUBMITTED" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            AnalyticsEvent.PaymentSubmitted(paymentMethod)
        }
        "PAYMENT_PROCESSING_STARTED" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            AnalyticsEvent.PaymentProcessingStarted(paymentMethod)
        }
        "PAYMENT_SUCCESS" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            val paymentId = metadata["paymentId"] ?: return null
            AnalyticsEvent.PaymentSuccess(paymentMethod, paymentId)
        }
        "PAYMENT_FAILURE" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            val paymentId = metadata["paymentId"]
            AnalyticsEvent.PaymentFailure(paymentMethod, paymentId)
        }
        "PAYMENT_THREEDS" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            val threedsProvider = metadata["threedsProvider"] ?: return null
            val threedsResponse = metadata["threedsResponse"]
            AnalyticsEvent.PaymentThreeDS(paymentMethod, threedsProvider, threedsResponse)
        }
        "PAYMENT_REDIRECT_TO_THIRD_PARTY" -> {
            val paymentMethod = metadata?.get("paymentMethod") ?: return null
            val redirectDestinationUrl = metadata["redirectDestinationUrl"] ?: return null
            AnalyticsEvent.PaymentRedirect(paymentMethod, redirectDestinationUrl)
        }

        "VAULT_LIST_OPENED" ->
            AnalyticsEvent.VaultListOpened(metadata.vaultString("vaultedMethodId"))
        "VAULT_OTHER_PAY_METHODS_REQUESTED" ->
            AnalyticsEvent.VaultOtherPayMethodsRequested(metadata.vaultString("vaultedMethodId"))
        "VAULT_METHOD_SELECTED" -> {
            val vaultedMethodId = metadata.vaultString("vaultedMethodId") ?: return null
            AnalyticsEvent.VaultMethodSelected(vaultedMethodId, metadata.vaultString("previousVaultedMethodId"))
        }
        "VAULT_EDIT_MODE_ENTERED" ->
            AnalyticsEvent.VaultEditModeEntered(metadata?.get("vaultedMethodCount")?.toIntOrNull())
        "VAULT_EDIT_MODE_EXITED" ->
            AnalyticsEvent.VaultEditModeExited(metadata?.get("exitedFromConfirmation")?.toBooleanStrictOrNull())
        "VAULT_DELETION_REQUESTED" -> {
            val vaultedMethodId = metadata.vaultString("vaultedMethodId") ?: return null
            AnalyticsEvent.VaultDeletionRequested(vaultedMethodId, metadata?.get("isActive")?.toBooleanStrictOrNull())
        }
        "VAULT_DELETION_CANCELLED" -> {
            val vaultedMethodId = metadata.vaultString("vaultedMethodId") ?: return null
            AnalyticsEvent.VaultDeletionCancelled(vaultedMethodId)
        }
        "VAULT_METHOD_DELETED" -> {
            val vaultedMethodId = metadata.vaultString("vaultedMethodId") ?: return null
            AnalyticsEvent.VaultMethodDeleted(
                vaultedMethodId,
                metadata?.get("isActive")?.toBooleanStrictOrNull(),
                metadata.vaultString("promotedVaultedMethodId"),
            )
        }
        "VAULT_METHOD_DELETION_FAILED" -> {
            val vaultedMethodId = metadata.vaultString("vaultedMethodId") ?: return null
            AnalyticsEvent.VaultMethodDeletionFailed(
                vaultedMethodId,
                metadata.vaultString("errorId"),
                metadata?.get("isActive")?.toBooleanStrictOrNull(),
            )
        }
        "VAULT_CVV_REQUIRED_RENDERED" -> {
            val vaultedMethodId = metadata.vaultString("vaultedMethodId") ?: return null
            AnalyticsEvent.VaultCvvRequiredRendered(
                vaultedMethodId,
                metadata.vaultString("network"),
                metadata?.get("expectedCvvLength")?.toIntOrNull(),
            )
        }
        "VAULT_CVV_SUBMITTED" -> {
            val vaultedMethodId = metadata.vaultString("vaultedMethodId") ?: return null
            AnalyticsEvent.VaultCvvSubmitted(vaultedMethodId, metadata.vaultString("network"))
        }
        "VAULT_CVV_REQUIRED_DISMISSED" -> {
            val vaultedMethodId = metadata.vaultString("vaultedMethodId") ?: return null
            AnalyticsEvent.VaultCvvRequiredDismissed(vaultedMethodId)
        }
        "VAULT_CVV_SUBMISSION_FAILED" -> {
            val vaultedMethodId = metadata.vaultString("vaultedMethodId") ?: return null
            AnalyticsEvent.VaultCvvSubmissionFailed(vaultedMethodId, metadata.vaultString("errorId"))
        }

        else -> null
    }
}

// RN sends "" as the absent-value sentinel; treat it as null (matches the iOS bridge).
private fun Map<String, String>?.vaultString(key: String): String? =
    this?.get(key)?.takeIf { it.isNotEmpty() }
