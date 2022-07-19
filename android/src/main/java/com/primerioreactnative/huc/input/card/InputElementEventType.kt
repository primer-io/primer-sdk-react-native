package com.primerioreactnative.huc.input.card

internal enum class InputElementEventType(
  val nativeEventName: String,
  val exportedEventName: String
) {

  ON_VALUE_IS_VALID("inputElementValueIsValid", "onValueIsValid"),
  ON_VALUE_CHANGE("inputElementValueChanged", "onValueChange"),
  ON_VALUE_TYPE_DETECT("inputElementDidDetectCardType", "onValueTypeDetect"),
  ON_FOCUS("inputElementDidFocus", "onFocus"),
  ON_BLUR("inputElementDidBlur", "onBlur"),
}
