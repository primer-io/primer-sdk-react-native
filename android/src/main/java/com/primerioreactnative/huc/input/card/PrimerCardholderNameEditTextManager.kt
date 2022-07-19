package com.primerioreactnative.huc.input.card

import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.views.view.ReactViewBackgroundManager
import io.primer.android.components.ui.widgets.PrimerCardholderNameEditText

class PrimerCardholderNameEditTextManager :
  PrimerSimpleInputViewManager<RNPrimerCardholderNameEditText>() {

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): RNPrimerCardholderNameEditText {
    return RNPrimerCardholderNameEditText(reactContext).apply {
      setPrimerInputElementListener(PrimerRNInputElementListener(reactContext, this))
      onFocusChangeListener = PrimerRNFocusListener(reactContext)
    }
  }

  companion object {
    const val REACT_CLASS = "NativeCardHolderInputElementView"
  }
}

class RNPrimerCardholderNameEditText(reactContext: ThemedReactContext) :
  PrimerCardholderNameEditText(reactContext), PrimerRNInputElement {

  override val reactViewBackgroundManager: ReactViewBackgroundManager =
    ReactViewBackgroundManager(this)
}
