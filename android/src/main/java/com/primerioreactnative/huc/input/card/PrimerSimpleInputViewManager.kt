package com.primerioreactnative.huc.input.card

import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.Spacing
import com.facebook.react.uimanager.ViewProps
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.annotations.ReactPropGroup
import com.facebook.react.views.text.DefaultStyleValuesUtil
import com.facebook.yoga.YogaConstants
import io.primer.android.components.ui.widgets.PrimerEditText

abstract class PrimerSimpleInputViewManager<T> :
  SimpleViewManager<T>() where T : PrimerRNInputElement, T : PrimerEditText {

  private val SPACING_TYPES = intArrayOf(
    Spacing.ALL, Spacing.LEFT, Spacing.RIGHT, Spacing.TOP, Spacing.BOTTOM
  )

  override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
    return mapOf(
      InputElementEventType.ON_VALUE_IS_VALID.nativeEventName to mapOf(
        BUBBLING_EVENT_NAME to mapOf(
          BUBBLING_EVENT to InputElementEventType.ON_VALUE_IS_VALID.exportedEventName
        )
      ),
      InputElementEventType.ON_VALUE_CHANGE.nativeEventName to mapOf(
        BUBBLING_EVENT_NAME to mapOf(
          BUBBLING_EVENT to InputElementEventType.ON_VALUE_CHANGE.exportedEventName
        )
      ),
      InputElementEventType.ON_VALUE_TYPE_DETECT.nativeEventName to mapOf(
        BUBBLING_EVENT_NAME to mapOf(
          BUBBLING_EVENT to InputElementEventType.ON_VALUE_TYPE_DETECT.exportedEventName
        )
      ),
      InputElementEventType.ON_FOCUS.nativeEventName to mapOf(
        BUBBLING_EVENT_NAME to mapOf(
          BUBBLING_EVENT to InputElementEventType.ON_FOCUS.exportedEventName
        )
      ),
      InputElementEventType.ON_BLUR.nativeEventName to mapOf(
        BUBBLING_EVENT_NAME to mapOf(
          BUBBLING_EVENT to InputElementEventType.ON_BLUR.exportedEventName
        )
      )
    )
  }

  @ReactProp(name = "borderStyle")
  fun setBorderStyle(view: T, borderStyle: String?) {
    view.setBorderStyle(borderStyle)
  }

  @ReactPropGroup(
    names = [ViewProps.BORDER_WIDTH, ViewProps.BORDER_LEFT_WIDTH, ViewProps.BORDER_RIGHT_WIDTH,
      ViewProps.BORDER_TOP_WIDTH, ViewProps.BORDER_BOTTOM_WIDTH],
    defaultFloat = Float.NaN
  )
  fun setBorderWidth(view: T, index: Int, width: Float) {
    var width = width
    if (!YogaConstants.isUndefined(width)) {
      width = PixelUtil.toPixelFromDIP(width)
    }
    view.setBorderWidth(SPACING_TYPES[index], width)
  }

  @ReactPropGroup(
    names = ["borderColor", "borderLeftColor", "borderRightColor", "borderTopColor", "borderBottomColor"],
    customType = "Color"
  )
  fun setBorderColor(view: T, index: Int, color: Int?) {
    val rgbComponent =
      if (color == null) YogaConstants.UNDEFINED else (color and 0x00FFFFFF).toFloat()
    val alphaComponent =
      if (color == null) YogaConstants.UNDEFINED else (color ushr 24).toFloat()
    view.setBorderColor(SPACING_TYPES[index], rgbComponent, alphaComponent)
  }

  @ReactProp(name = "placeholder")
  open fun setPlaceholder(view: T, placeholder: String?) {
    view.hint = placeholder
  }

  @ReactProp(name = "placeholderTextColor", customType = "Color")
  open fun setPlaceholderTextColor(view: T, color: Int?) {
    if (color == null) {
      view.setHintTextColor(DefaultStyleValuesUtil.getDefaultTextColorHint(view.context))
    } else {
      view.setHintTextColor(color)
    }
  }

  private companion object {
    const val BUBBLING_EVENT_NAME = "phasedRegistrationNames"
    const val BUBBLING_EVENT = "bubbled"
  }
}
