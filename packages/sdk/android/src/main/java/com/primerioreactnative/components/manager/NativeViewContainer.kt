package com.primerioreactnative.components.manager

import android.util.Log
import android.view.View
import android.widget.FrameLayout
import com.facebook.react.uimanager.ThemedReactContext

class NativeViewContainer(private val context: ThemedReactContext) : FrameLayout(context) {
  fun addViewImpl(view: View) {
    addView(view)
    view.setOnClickListener {
      (this.parent as? View)?.performClick()
        ?: run {
          Log.e(
            "NativeViewContainer",
            "Unable to find parent of NativeViewContainer.",
          )
        }
    }
    viewTreeObserver.addOnGlobalLayoutListener { requestLayout() }
  }

  override fun requestLayout() {
    super.requestLayout()
    post(mLayoutRunnable)
  }

  private val mLayoutRunnable =
    Runnable {
      measure(
        MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
        MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY),
      )
      layout(left, top, right, bottom)
    }
}
