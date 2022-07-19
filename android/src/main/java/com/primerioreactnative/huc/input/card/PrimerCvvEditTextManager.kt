package com.primerioreactnative.huc.input.card

import com.facebook.react.uimanager.ThemedReactContext
import io.primer.android.components.ui.widgets.PrimerCvvEditText

class PrimerCvvEditTextManager : PrimerSimpleInputViewManager<PrimerCvvEditText>() {

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): PrimerCvvEditText {
    return PrimerCvvEditText(reactContext).apply {
      setPrimerInputElementListener(PrimerRNInputElementListener(reactContext, this))
      onFocusChangeListener = PrimerRNFocusListener(reactContext)
    }
  }

  companion object {
    const val REACT_CLASS = "NativeCVVInputElementView"
  }
}
