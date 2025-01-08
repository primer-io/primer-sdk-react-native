package com.primerioreactnative.utils

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

internal fun JSONObject?.toWritableMap(): WritableMap = this?.let { convertJsonToMap(this) } ?: Arguments.createMap()

internal fun JSONArray?.toWritableArray(): WritableArray =
  this?.let {
    convertJsonToArray(this)
  } ?: Arguments.createArray()

@Throws(JSONException::class)
internal fun convertJsonToMap(jsonObject: JSONObject): WritableMap {
  val map = Arguments.createMap()
  val iterator = jsonObject.keys()
  while (iterator.hasNext()) {
    val key = iterator.next()
    when (val value = jsonObject[key]) {
      is JSONObject -> map.putMap(key, convertJsonToMap(value))
      is JSONArray -> map.putArray(key, convertJsonToArray(value))
      is Boolean -> map.putBoolean(key, value)
      is Int -> map.putInt(key, value)
      is Double -> map.putDouble(key, value)
      is String -> map.putString(key, value)
      else -> map.putString(key, value.toString())
    }
  }
  return map
}

@Throws(JSONException::class)
internal fun convertJsonToArray(jsonArray: JSONArray): WritableArray {
  val array: WritableArray = Arguments.createArray()
  for (i in 0 until jsonArray.length()) {
    when (val value = jsonArray[i]) {
      is JSONObject -> array.pushMap(convertJsonToMap(value))
      is JSONArray -> array.pushArray(convertJsonToArray(value))
      is Boolean -> array.pushBoolean(value)
      is Int -> array.pushInt(value)
      is Double -> array.pushDouble(value)
      is String -> array.pushString(value)
      else -> array.pushString(value.toString())
    }
  }
  return array
}
