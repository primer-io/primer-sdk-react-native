package com.primerioreactnative.huc.input.card

import android.view.View
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

class PrimerRNFocusListener(private val reactContext: ReactContext) : View.OnFocusChangeListener {
  override fun onFocusChange(v: View, hasFocus: Boolean) {
    reactContext
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(
        v.id,
        if (hasFocus) InputElementEventType.ON_FOCUS.nativeEventName
        else InputElementEventType.ON_BLUR.nativeEventName,
        null
      )
  }
}
