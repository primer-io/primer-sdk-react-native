package com.primerioreactnative.huc.input.card

import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import io.primer.android.components.ui.widgets.elements.PrimerInputElement
import io.primer.android.components.ui.widgets.elements.PrimerInputElementListener
import io.primer.android.ui.CardType

internal class PrimerRNInputElementListener(
  private val reactContext: ThemedReactContext,
  private val view: View
) : PrimerInputElementListener {

  override fun onValueIsValid(inputElement: PrimerInputElement, isValid: Boolean) {
    val event = Arguments.createMap().apply {
      putBoolean("isValid", isValid)
    }
    reactContext
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(view.id, InputElementEventType.ON_VALUE_IS_VALID.nativeEventName, event)
  }

  override fun onValueChanged(inputElement: PrimerInputElement) {
    reactContext
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(view.id, InputElementEventType.ON_VALUE_CHANGE.nativeEventName, null)
  }

  override fun onValueTypeDetected(type: CardType.Type) {
    val event = Arguments.createMap().apply {
      putString("type", type.name)
    }
    reactContext
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(view.id, InputElementEventType.ON_VALUE_TYPE_DETECT.nativeEventName, event)
  }
}
