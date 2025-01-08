package com.primerioreactnative.components.manager.googlePay

import android.content.Context
import android.view.View
import android.widget.TextView
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.primerioreactnative.components.manager.NativeViewContainer

class PrimerGooglePayButtonManager : SimpleViewManager<NativeViewContainer>() {
  override fun getName() = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext): NativeViewContainer =
    NativeViewContainer(
      reactContext,
    )

  override fun onAfterUpdateTransaction(view: NativeViewContainer) {
    super.onAfterUpdateTransaction(view)
    view.addViewImpl(
      getPrimerGooglePayButtonOrNull(view.context)
        ?: TextView(view.context).apply { text = "Error loading Google Pay button" },
    )
  }

  private fun getPrimerGooglePayButtonOrNull(context: Context): View? {
    return createPrimerGooglePayButton?.invoke(context) ?: return null
  }

  companion object {
    var createPrimerGooglePayButton: ((context: Context) -> View)? = null
      private set

    fun updatePrimerGooglePayButtonCreator(creator: (context: Context) -> View) {
      this.createPrimerGooglePayButton = creator
    }

    const val REACT_CLASS = "PrimerGooglePayButton"
  }
}
