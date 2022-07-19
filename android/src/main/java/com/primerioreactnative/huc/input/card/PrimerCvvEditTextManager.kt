package com.primerioreactnative.huc.input.card

import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.views.view.ReactViewBackgroundManager
import io.primer.android.components.ui.widgets.PrimerCardNumberEditText
import io.primer.android.components.ui.widgets.PrimerCvvEditText

class PrimerCvvEditTextManager : PrimerSimpleInputViewManager<RNPrimerCvvEditText>() {

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): RNPrimerCvvEditText {
    return RNPrimerCvvEditText(reactContext).apply {
      setPrimerInputElementListener(PrimerRNInputElementListener(reactContext, this))
      onFocusChangeListener = PrimerRNFocusListener(reactContext)
    }
  }

  companion object {
    const val REACT_CLASS = "NativeCVVInputElementView"
  }
}

class RNPrimerCvvEditText(reactContext: ThemedReactContext) :
  PrimerCvvEditText(reactContext), PrimerRNInputElement {

  override val reactViewBackgroundManager: ReactViewBackgroundManager =
    ReactViewBackgroundManager(this)
}
