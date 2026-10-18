package com.primerioreactnative.components.manager.googlePay

import android.content.Context
import android.view.View
import android.widget.FrameLayout
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
            getPrimerGooglePayButtonOrNull(view.context)?.let { WindowLayoutFrame(view.context).apply { addView(it) } }
                ?: TextView(view.context).apply { text = "Error loading Google Pay button" },
        )
    }

    private fun getPrimerGooglePayButtonOrNull(context: Context): View? {
        return createPrimerGooglePayButton?.invoke(context) ?: return null
    }

    // Google's button shows its content only after the window's next layout pass, which React Native's
    // parents never request, so this asks the window for one.
    private class WindowLayoutFrame(context: Context) : FrameLayout(context) {
        override fun requestLayout() {
            super.requestLayout()
            if (rootView !== this) rootView.requestLayout()
        }

        // The container sets its click listener on the view it is given; the button is what gets clicked.
        override fun setOnClickListener(listener: OnClickListener?) {
            getChildAt(0)?.setOnClickListener(listener)
        }
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
