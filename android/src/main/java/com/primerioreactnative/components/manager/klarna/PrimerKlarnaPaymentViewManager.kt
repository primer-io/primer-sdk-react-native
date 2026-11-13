package com.primerioreactnative.components.manager.klarna

import android.util.Log
import android.view.View
import android.widget.TextView
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.primerioreactnative.components.manager.ContentHeightChangeEvent
import com.primerioreactnative.components.manager.NativeViewContainer
import io.primer.android.klarna.api.ui.PrimerKlarnaPaymentView
import java.lang.ref.WeakReference

class PrimerKlarnaPaymentViewManager : SimpleViewManager<NativeViewContainer>() {
    override fun getName() = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): NativeViewContainer =
        NativeViewContainer(reactContext).apply {
            onContentHeightChange = { heightPx ->
                UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)?.dispatchEvent(
                    ContentHeightChangeEvent(
                        UIManagerHelper.getSurfaceId(this),
                        id,
                        PixelUtil.toDIPFromPixel(heightPx.toFloat()),
                    ),
                )
            }
        }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> =
        super.getExportedCustomDirectEventTypeConstants().orEmpty() +
            mapOf(
                ContentHeightChangeEvent.EVENT_NAME to
                    mapOf("registrationName" to ContentHeightChangeEvent.REGISTRATION_NAME),
            )

    override fun onAfterUpdateTransaction(view: NativeViewContainer) {
        super.onAfterUpdateTransaction(view)
        val klarnaView = getPrimerKlarnaPaymentViewOrNull()
        when {
            klarnaView != null -> view.addViewImpl(klarnaView)
            view.childCount == 0 -> {
                Log.w(REACT_CLASS, "Klarna payment view unavailable; rendering fallback")
                view.addViewImpl(TextView(view.context).apply { text = "Error loading Klarna payment view" })
            }
        }
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
