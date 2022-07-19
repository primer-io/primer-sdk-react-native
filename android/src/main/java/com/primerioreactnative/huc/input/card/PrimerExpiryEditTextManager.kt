package com.primerioreactnative.huc.input.card

import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.views.view.ReactViewBackgroundManager
import io.primer.android.components.ui.widgets.PrimerExpiryEditText

class PrimerExpiryEditTextManager : PrimerSimpleInputViewManager<RNPrimerExpiryEditText>() {

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): RNPrimerExpiryEditText {
    return RNPrimerExpiryEditText(reactContext).apply {
      setPrimerInputElementListener(PrimerRNInputElementListener(reactContext, this))
      onFocusChangeListener = PrimerRNFocusListener(reactContext)
    }
  }

  companion object {
    const val REACT_CLASS = "NativeExpiryDateInputElementView"
  }
}

class RNPrimerExpiryEditText(reactContext: ThemedReactContext) :
  PrimerExpiryEditText(reactContext), PrimerRNInputElement {

  override val reactViewBackgroundManager: ReactViewBackgroundManager =
    ReactViewBackgroundManager(this)
}
