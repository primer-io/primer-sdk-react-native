package com.primerioreactnative

import org.json.JSONObject
import java.lang.Exception

class OptionsDeserializer(serialized: String) {
  private var json: JSONObject? = try {
    JSONObject(serialized)
  } catch (e: Exception) {
    null
  }

  fun <T> get(key: String): T? {
    return json?.opt(key) as T?
  }

  fun <T> get(key: String, default: T): T {
    return get(key) ?: default
  }
}
