package com.primerioreactnative.extensions

import android.content.Context
import com.primerioreactnative.datamodels.PrimerUIOptionsRN
import io.primer.android.data.settings.DismissalMechanism
import io.primer.android.ui.settings.PrimerUIOptions

@OptIn(kotlin.ExperimentalStdlibApi::class)
internal fun PrimerUIOptionsRN.toPrimerUIOptions(context: Context, appearanceMode: String?) =
    PrimerUIOptions(
        isInitScreenEnabled,
        isSuccessScreenEnabled,
        isErrorScreenEnabled,
        buildSet {
            for (it in dismissalMechanism.orEmpty()) {
                when (it) {
                    "gestures" -> add(DismissalMechanism.GESTURES)
                    "closeButton" -> add(DismissalMechanism.CLOSE_BUTTON)
                    else -> { /* no-op */ }
                }
            }
        }.toList().takeIf { it.isNotEmpty() } ?: listOf(DismissalMechanism.GESTURES),
        theme.toPrimerTheme(isDarkAppearance(appearanceMode, orSystem = context.isSystemDarkAppearance())),
        cardFormUIOptions.toPrimerCardFormUIOptions(),
    )

internal fun isDarkAppearance(appearanceMode: String?, orSystem: Boolean): Boolean =
    when (appearanceMode) {
        "DARK" -> true
        "LIGHT" -> false
        else -> orSystem
    }
