package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerDebugOptionsRN
import io.primer.android.data.settings.PrimerDebugOptions

internal fun PrimerDebugOptionsRN.toPrimerDebugOptions() = PrimerDebugOptions(is3DSSanityCheckEnabled)
