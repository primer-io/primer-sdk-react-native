package com.primerioreactnative.components.manager

import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.facebook.react.uimanager.ThemedReactContext

class NativeViewContainer(private val context: ThemedReactContext) : FrameLayout(context) {
    var onContentHeightChange: ((heightPx: Int) -> Unit)? = null

    private var lastContentHeight = 0

    private var contentWidth = 0

    // Not the view's isLayoutRequested: React laying out the container in between clears it.
    private var isContentLayoutRequested = false

    fun addViewImpl(view: View) {
        if (view.parent === this) return
        removeAllViews()
        // Shared native view: detach from any previous container or addView throws "child already has a parent".
        (view.parent as? ViewGroup)?.removeView(view)
        addView(view)
        lastContentHeight = 0
        view.setOnClickListener {
            (this.parent as? View)?.performClick()
                ?: run {
                    Log.e(
                        "NativeViewContainer",
                        "Unable to find parent of NativeViewContainer.",
                    )
                }
        }
    }

    override fun requestLayout() {
        isContentLayoutRequested = true
        super.requestLayout()
        post(mLayoutRunnable)
    }

    override fun onSizeChanged(
        w: Int,
        h: Int,
        oldw: Int,
        oldh: Int,
    ) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (w != oldw) post(mLayoutRunnable)
    }

    private val mLayoutRunnable =
        Runnable {
            onContentHeightChange?.let { notify -> measureContentHeight()?.let(notify) }
            measure(
                MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY),
            )
            layout(left, top, right, bottom)
        }

    private fun measureContentHeight(): Int? {
        val child = getChildAt(0)
        if (child == null || width == 0 || !isContentStale()) return null
        child.measure(
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED),
        )
        contentWidth = width
        isContentLayoutRequested = false
        // Without it, the exact measure that follows reuses this cached unbounded result.
        forceLayout()
        return child.measuredHeight
            .takeIf { it > 0 && it != lastContentHeight }
            ?.also { lastContentHeight = it }
    }

    private fun isContentStale() = isContentLayoutRequested || width != contentWidth
}
