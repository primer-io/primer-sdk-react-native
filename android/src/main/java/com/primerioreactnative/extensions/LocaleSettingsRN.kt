package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.LocaleSettingsRN
import java.util.*

internal fun LocaleSettingsRN.toLocale(): Locale {
  return when {
    languageCode == null -> Locale.getDefault()
    localeCode == null -> Locale(languageCode)
    else -> Locale(languageCode, localeCode)
  }
}
