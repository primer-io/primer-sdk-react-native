package com.primerioreactnative.huc.extensions

import com.facebook.react.bridge.Arguments

internal fun Map<String, String>.toArgumentsMap() =
  Arguments.createMap().apply {
    entries.forEach {
      putString(it.key, it.value)
    }
  }
