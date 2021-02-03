package com.primerioreactnative

import android.util.Log
import io.primer.android.UniversalCheckoutTheme
import org.json.JSONObject
import java.util.*

object ThemeDecoder {
  private val hexPattern = Regex("^#[0-9a-fA-F]{6,8}$")

  fun fromJson(obj: JSONObject): UniversalCheckoutTheme {
    return UniversalCheckoutTheme.create(
      buttonCornerRadius = JSONPrimitiveDecoder.asFloatOpt(obj, "buttonCornerRadius"),
      inputCornerRadius = JSONPrimitiveDecoder.asFloatOpt(obj, "inputCornerRadius"),
      backgroundColor = colorFromString(obj, "backgroundColor"),
      buttonPrimaryColor = colorFromString(obj, "buttonPrimaryColor"),
      buttonPrimaryColorDisabled = colorFromString(obj, "buttonPrimaryColorDisabled"),
      buttonDefaultColor = colorFromString(obj, "buttonDefaultColor"),  //: Int? = null,
      buttonDefaultColorDisabled = colorFromString(obj, "buttonDefaultColorDisabled"),
      buttonDefaultBorderColor = colorFromString(obj, "buttonDefaultBorderColor"),
      textDefaultColor = colorFromString(obj, "textDefaultColor"),
      textDangerColor = colorFromString(obj, "textDangerColor"),
      textMutedColor = colorFromString(obj, "textMutedColor"),
      primaryColor = colorFromString(obj, "primaryColor"),
      inputBackgroundColor = colorFromString(obj, "inputBackgroundColor"),
      windowMode = getWindowMode(obj)
    )
  }

  /**
   * hex is in format rrggbb(aa)
   * For android, it needs to be a string in aarrggbb format
   */
  private fun colorFromString(obj: JSONObject, name: String): String? {
    val hex = JSONPrimitiveDecoder.asStringOpt(obj, name) ?: return null

    if (!hex.matches(hexPattern)) {
      Log.i("primer-rn", "$hex Does not match")
      return null
    }

    val r = hex.substring(1..2).toUpperCase(Locale.ROOT)
    val g = hex.substring(3..4).toUpperCase(Locale.ROOT)
    val b = hex.substring(5..6).toUpperCase(Locale.ROOT)

    val a = if (hex.length == 7) "FF" else hex.substring(7..8).toUpperCase(Locale.ROOT)
    val argb = "#$a$r$g$b"

    return argb
  }

  private fun getWindowMode(obj: JSONObject): UniversalCheckoutTheme.WindowMode {
    val mode = obj
      .takeIf { it.has("android") }
      ?.getJSONObject("android")
      ?.takeIf { it.has("windowMode") }
      ?.getString("windowMode")

    return when (mode) {
      "BOTTOM_SHEET" -> UniversalCheckoutTheme.WindowMode.BOTTOM_SHEET
      "FULL_SCREEN" -> UniversalCheckoutTheme.WindowMode.FULL_HEIGHT
      else -> UniversalCheckoutTheme.WindowMode.BOTTOM_SHEET
    }
  }
}
