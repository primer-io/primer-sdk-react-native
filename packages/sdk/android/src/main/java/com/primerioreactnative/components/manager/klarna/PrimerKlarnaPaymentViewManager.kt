package com.primerioreactnative.components.manager.klarna

import android.widget.TextView
import android.widget.FrameLayout
import android.view.ViewGroup
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import io.primer.android.components.presentation.paymentMethods.nativeUi.klarna.PrimerKlarnaPaymentView
import java.lang.ref.WeakReference

class PrimerKlarnaPaymentViewManager : SimpleViewManager<PrimerKlarnaPaymentView>() {
  override fun getName() = REACT_CLASS

  override fun createViewInstance(context: ThemedReactContext) =
      primerKlarnaPaymentView.get()?.apply { 
        // TODO TWS-94: fix sizing
        // layoutParams = ViewGroup.LayoutParams(750, 750)
        // getChildAt(0).layoutParams = FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT)
       }
          ?: PrimerKlarnaPaymentView(context).apply {
            addView(TextView(context).apply { text = "Error loading Klarna payment view" })
          }

  companion object {
    var primerKlarnaPaymentView: WeakReference<PrimerKlarnaPaymentView?> = WeakReference(null)
      private set

    fun updatePrimerKlarnaPaymentView(view: PrimerKlarnaPaymentView) {
      primerKlarnaPaymentView = WeakReference(view)
    }

    const val REACT_CLASS = "PrimerKlarnaPaymentView"
  }
}
