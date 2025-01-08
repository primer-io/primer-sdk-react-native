package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerUIOptionsRN
import io.primer.android.ui.settings.PrimerUIOptions

internal fun PrimerUIOptionsRN.toPrimerUIOptions() =
  PrimerUIOptions(
    isInitScreenEnabled,
    isSuccessScreenEnabled,
    isErrorScreenEnabled,
    theme.toPrimerTheme(),
  )
