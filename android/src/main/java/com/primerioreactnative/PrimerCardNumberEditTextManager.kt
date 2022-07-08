package com.primerioreactnative

import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.GradientDrawable
import android.view.ViewGroup
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import com.facebook.drawee.backends.pipeline.Fresco
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewProps
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.image.ReactImageView
import io.primer.android.components.manager.PrimerCardManager
import io.primer.android.components.manager.PrimerUniversalCheckoutCardManagerInterface
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
