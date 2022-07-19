package com.primerioreactnative.huc.input.card

import com.facebook.react.uimanager.ThemedReactContext
import io.primer.android.ExperimentalPrimerApi
import io.primer.android.components.ui.widgets.PrimerCardNumberEditText

@ExperimentalPrimerApi
class PrimerCardNumberEditTextManager : PrimerSimpleInputViewManager<PrimerCardNumberEditText>() {

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): PrimerCardNumberEditText {
    return PrimerCardNumberEditText(reactContext).apply {
      setPrimerInputElementListener(PrimerRNInputElementListener(reactContext, this))
      onFocusChangeListener = PrimerRNFocusListener(reactContext)
    }
  }

  companion object {
    const val REACT_CLASS = "NativeCardNumberInputElementView"
  }
}
