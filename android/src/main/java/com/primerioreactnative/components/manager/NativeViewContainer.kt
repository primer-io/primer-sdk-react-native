package com.primerioreactnative.components.manager

import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.facebook.react.uimanager.ThemedReactContext

class NativeViewContainer(private val context: ThemedReactContext) : FrameLayout(context) {
    fun addViewImpl(view: View) {
        // The Klarna payment view is a single shared instance. If a new container is created (re-entry /
        // re-render / Fabric view preallocation) while the previous one still holds it, addView throws
        // "child already has a parent" and crashes the surface. Detach from the old parent first.
        (view.parent as? ViewGroup)?.removeView(view)
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
