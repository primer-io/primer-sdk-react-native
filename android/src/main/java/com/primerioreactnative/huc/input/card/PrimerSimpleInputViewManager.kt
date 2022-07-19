package com.primerioreactnative.huc.input.card

import com.facebook.react.uimanager.SimpleViewManager
import io.primer.android.components.ui.widgets.PrimerEditText
import io.primer.android.components.ui.widgets.elements.PrimerInputElement

abstract class PrimerSimpleInputViewManager<T> :
  SimpleViewManager<T>() where T : PrimerInputElement, T : PrimerEditText {

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

  private companion object {
    const val BUBBLING_EVENT_NAME = "phasedRegistrationNames"
    const val BUBBLING_EVENT = "bubbled"
  }
}
