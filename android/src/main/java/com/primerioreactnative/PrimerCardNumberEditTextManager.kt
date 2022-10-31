package com.primerioreactnative

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import io.primer.android.components.ui.widgets.*

val listOfTextInputs = mutableListOf<PrimerEditText>()

class PrimerCardNumberEditTextManager : SimpleViewManager<PrimerCardNumberEditText>() {

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): PrimerCardNumberEditText {
    val editText = PrimerCardNumberEditText(reactContext)
    return editText
  }

  companion object {
    const val REACT_CLASS = "PrimerCardNumberEditText"
  }
}

class PrimerCardholderNameEditTextManager : SimpleViewManager<PrimerCardholderNameEditText>() {

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): PrimerCardholderNameEditText {
    return PrimerCardholderNameEditText(reactContext)
  }

  companion object {
    const val REACT_CLASS = "PrimerCardholderNameEditText"
  }
}

class PrimerExpiryEditTextManager : SimpleViewManager<PrimerExpiryEditText>() {

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): PrimerExpiryEditText {
    return PrimerExpiryEditText(reactContext)
  }

  companion object {
    const val REACT_CLASS = "PrimerExpiryEditText"
  }
}

class PrimerCvvEditTextManager : SimpleViewManager<PrimerCvvEditText>() {

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): PrimerCvvEditText {
    return PrimerCvvEditText(reactContext)
  }

  companion object {
    const val REACT_CLASS = "PrimerCvvEditText"
  }
}
