package com.primerioreactnative.huc.input.card

import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.views.view.ReactViewBackgroundManager
import io.primer.android.ExperimentalPrimerApi
import io.primer.android.components.ui.widgets.PrimerCardNumberEditText

@ExperimentalPrimerApi
class PrimerCardNumberEditTextManager : PrimerSimpleInputViewManager<RNPrimerCardNumberEditText>() {

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): RNPrimerCardNumberEditText {
    return RNPrimerCardNumberEditText(reactContext).apply {
      setPrimerInputElementListener(PrimerRNInputElementListener(reactContext, this))
      onFocusChangeListener = PrimerRNFocusListener(reactContext)
    }
  }

  companion object {
    const val REACT_CLASS = "NativeCardNumberInputElementView"
  }
}

class RNPrimerCardNumberEditText(reactContext: ThemedReactContext) :
  PrimerCardNumberEditText(reactContext), PrimerRNInputElement {

  override val reactViewBackgroundManager: ReactViewBackgroundManager =
    ReactViewBackgroundManager(this)
}

interface PrimerRNInputElement {

  val reactViewBackgroundManager: ReactViewBackgroundManager

  fun setBorderStyle(borderStyle: String?) {
    reactViewBackgroundManager.setBorderStyle(borderStyle)
  }

  fun setBorderColor(position: Int, rgb: Float, alpha: Float) {
    reactViewBackgroundManager.setBorderColor(position, rgb, alpha)
  }

  fun setBorderWidth(position: Int, width: Float) {
    reactViewBackgroundManager.setBorderWidth(position, width)
  }
}
