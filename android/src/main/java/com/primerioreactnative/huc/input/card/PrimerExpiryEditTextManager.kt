package com.primerioreactnative.huc.input.card

import com.facebook.react.uimanager.ThemedReactContext
import io.primer.android.components.ui.widgets.PrimerExpiryEditText

class PrimerExpiryEditTextManager : PrimerSimpleInputViewManager<PrimerExpiryEditText>() {

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): PrimerExpiryEditText {
    return PrimerExpiryEditText(reactContext).apply {
      setPrimerInputElementListener(PrimerRNInputElementListener(reactContext, this))
      onFocusChangeListener = PrimerRNFocusListener(reactContext)
    }
  }

  companion object {
    const val REACT_CLASS = "NativeExpiryDateInputElementView"
  }
}
