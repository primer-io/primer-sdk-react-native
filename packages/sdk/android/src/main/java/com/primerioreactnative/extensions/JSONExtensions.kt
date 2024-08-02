package com.primerioreactnative.extensions

import org.json.JSONObject
import org.json.JSONArray
import com.primerioreactnative.utils.convertJsonToMap
import com.primerioreactnative.utils.convertJsonToArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray

fun JSONObject?.toWritableMap(): WritableMap =
    this?.let { convertJsonToMap(this) } ?: Arguments.createMap()

fun JSONArray?.toWritableArray(): WritableArray =
    this?.let { convertJsonToArray(this) } ?: Arguments.createArray()