package com.primerioreactnative.components.manager.klarna

import android.view.View
import android.widget.TextView
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.primerioreactnative.components.manager.NativeViewContainer
import io.primer.android.klarna.api.ui.PrimerKlarnaPaymentView
import java.lang.ref.WeakReference

class PrimerKlarnaPaymentViewManager : SimpleViewManager<NativeViewContainer>() {
  override fun getName() = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext): NativeViewContainer = NativeViewContainer(reactContext)

  override fun onAfterUpdateTransaction(view: NativeViewContainer) {
    super.onAfterUpdateTransaction(view)
    view.addViewImpl(
      getPrimerKlarnaPaymentViewOrNull()
        ?: TextView(view.context).apply { text = "Error loading Klarna payment view" },
    )
  }

  private fun getPrimerKlarnaPaymentViewOrNull(): View? {
    return primerKlarnaPaymentView.get() ?: return null
  }

  companion object {
    private var primerKlarnaPaymentView: WeakReference<PrimerKlarnaPaymentView?> = WeakReference(null)
      private set

    fun updatePrimerKlarnaPaymentView(view: PrimerKlarnaPaymentView) {
      primerKlarnaPaymentView = WeakReference(view)
    }

    const val REACT_CLASS = "PrimerKlarnaPaymentView"
  }
}
