package com.primerioreactnative.components.manager.klarna

import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.TextView
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import io.primer.android.components.presentation.paymentMethods.nativeUi.klarna.PrimerKlarnaPaymentView
import java.lang.ref.WeakReference
import java.util.Timer
import java.util.TimerTask

class PrimerKlarnaPaymentViewManager(private val reactContext: ReactApplicationContext) :
    ViewGroupManager<ViewGroup>() {
  override fun getName() = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext) =
      FrameLayout(reactContext).apply {
        addView(
            getPrimerKlarnaPaymentViewOrNull(this)
                ?: PrimerKlarnaPaymentView(context).apply {
                  addView(TextView(context).apply { text = "Error loading Klarna payment view" })
                }
        )
        alpha = 0f
      }

  private fun getPrimerKlarnaPaymentViewOrNull(parent: ViewGroup): View? {
    val view = primerKlarnaPaymentView.get() ?: return null
    val handler = Handler(Looper.getMainLooper())
    val listener =
        object : View.OnLayoutChangeListener {
          private var timer: Timer? = null

          override fun onLayoutChange(
              v: View?,
              left: Int,
              top: Int,
              right: Int,
              bottom: Int,
              oldLeft: Int,
              oldTop: Int,
              oldRight: Int,
              oldBottom: Int
          ) {
            val listener = this
            timer?.cancel()
            timer =
                Timer().apply {
                  schedule(
                      object : TimerTask() {
                        override fun run() {
                          timer?.cancel()
                          timer = null
                          handler.post(
                              Runnable {
                                view.removeOnLayoutChangeListener(listener)
                                // Re-layout parent once KlarnaPaymentView loads
                                layout(view)
                                parent.alpha = 1f
                              }
                          )
                        }
                      },
                      300L
                  )
                }
          }
        }
    view.addOnLayoutChangeListener(listener)

    return view
  }

  private fun layout(view: View) {
    val oldX = view.getX().toInt()
    val oldY = view.getY().toInt()
    val parent = (view.parent as? View)
    val fallbackWidth = parent?.width ?: Int.MAX_VALUE
    val fallbackHeight = parent?.height ?: Int.MAX_VALUE
    view.measure(
        View.MeasureSpec.makeMeasureSpec(fallbackWidth, View.MeasureSpec.EXACTLY),
        View.MeasureSpec.makeMeasureSpec(fallbackHeight, View.MeasureSpec.EXACTLY)
    )
    view.layout(oldX, oldY, oldX + fallbackWidth, oldY + fallbackHeight)
  }

  companion object {
    private var primerKlarnaPaymentView: WeakReference<PrimerKlarnaPaymentView?> =
        WeakReference(null)
      private set

    fun updatePrimerKlarnaPaymentView(view: PrimerKlarnaPaymentView) {
      primerKlarnaPaymentView = WeakReference(view)
    }

    const val REACT_CLASS = "PrimerKlarnaPaymentView"
  }
}
