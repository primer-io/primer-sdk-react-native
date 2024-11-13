package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerUIOptionsRN
import io.primer.android.ui.settings.PrimerUIOptions

internal fun PrimerUIOptionsRN.toPrimerUIOptions() =
  PrimerUIOptions(
    isInitScreenEnabled,
    isSuccessScreenEnabled,
    isErrorScreenEnabled,
    dismissalMechanism?.let {
        when (it) {
            "gestures" -> PrimerUIOptions.DismissalMechanism.GESTURES
            "closeButton" -> PrimerUIOptions.DismissalMechanism.CLOSE_BUTTON
            else -> null
        }
    },
    theme.toPrimerTheme()
  )
