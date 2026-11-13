package com.primerioreactnative.extensions

import android.content.Context
import android.content.res.Configuration
import android.view.ContextThemeWrapper

internal fun Context.isSystemDarkAppearance() =
    (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES

// Keeps the Activity in the base-context chain, where Klarna's SDK looks it up.
internal fun Context.withDarkAppearance(isDarkAppearance: Boolean): Context =
    if (isSystemDarkAppearance() == isDarkAppearance) {
        this
    } else {
        ContextThemeWrapper(this, theme).apply {
            applyOverrideConfiguration(
                Configuration().apply {
                    uiMode = if (isDarkAppearance) Configuration.UI_MODE_NIGHT_YES else Configuration.UI_MODE_NIGHT_NO
                },
            )
        }
    }
