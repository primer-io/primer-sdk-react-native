package com.primerioreactnative

import org.json.JSONObject

object JSONPrimitiveDecoder {
  fun asIntOpt(raw: JSONObject, name: String, defaultVal: Int): Int {
    return asIntOpt(raw, name) ?: defaultVal
  }

  fun asIntOpt(raw: JSONObject, name: String): Int? {
    return takeIf(raw, name)?.getInt(name)
  }

  fun asStringOpt(raw: JSONObject, name: String): String? {
    return takeIf(raw, name)?.getString(name)
  }

  fun asFloatOpt(raw: JSONObject, name: String): Float? {
    return takeIf(raw, name)?.getDouble(name)?.toFloat()
  }

  private fun takeIf(raw: JSONObject, name: String): JSONObject? {
    return raw.takeIf { it.has(name) && !it.isNull(name) }
  }
}
