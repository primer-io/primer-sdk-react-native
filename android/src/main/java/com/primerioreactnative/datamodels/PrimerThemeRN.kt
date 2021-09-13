package com.primerioreactnative.datamodels

import io.primer.android.UniversalCheckoutTheme
import kotlinx.serialization.Serializable

@Serializable
class PrimerThemeRN(
  private val colors: ColorThemeRN? = null,
  val darkModeColors: ColorThemeRN? = null,
) {
  val primerTheme: UniversalCheckoutTheme
    get() {
      return UniversalCheckoutTheme.create(
        textDefaultColor = colors?.text?.hex,
        textDangerColor = colors?.error?.hex,
        textMutedColor = colors?.disabled?.hex,
        backgroundColor = colors?.background?.hex,
        buttonPrimaryColor = colors?.mainColor?.hex,
        buttonPrimaryColorDisabled = colors?.disabled?.hex,
        primaryColor = colors?.mainColor?.hex,
        inputBackgroundColor = colors?.background?.hex,
        buttonDefaultBorderColor = colors?.borders?.hex,
      )
    }
}

@Serializable
class ColorThemeRN(
  val mainColor: ColorRN? = null,
  val contrastingColor: ColorRN? = null,
  val background: ColorRN? = null,
  val text: ColorRN? = null,
  val contrastingText: ColorRN? = null,
  val borders: ColorRN? = null,
  val disabled: ColorRN? = null,
  val error: ColorRN? = null,
)

@Serializable
class ColorRN(
  private val red: Int,
  private val green: Int,
  private val blue: Int,
  private val alpha: Int,
) {

  val hex: String
    get() {
      val alpha = pad(Integer.toHexString(alpha))
      val red = pad(Integer.toHexString(red))
      val green = pad(Integer.toHexString(green))
      val blue = pad(Integer.toHexString(blue))
      return "#$alpha$red$green$blue"
    }

  private fun pad(s: String): String {
    return if (s.length == 1) "0$s" else s
  }
}
