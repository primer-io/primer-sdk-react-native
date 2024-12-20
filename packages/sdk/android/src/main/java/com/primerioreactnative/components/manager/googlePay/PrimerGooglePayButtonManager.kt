package com.primerioreactnative.components.manager.googlePay

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.TextView
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import java.util.Timer
import java.util.TimerTask
import android.util.AttributeSet
import android.view.MotionEvent
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.uimanager.events.RCTModernEventEmitter
import android.util.Log


class PrimerGooglePayButtonManager(private val reactContext: ReactApplicationContext) :
  ViewGroupManager<ViewGroup>() {
  override fun getName() = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext) =
    FrameLayout(reactContext).apply {
      addView(
        getPrimerGooglePayButtonOrNull(context)
          ?: TextView(context).apply { text = "Error loading Google Pay button" }
      )
      isClickable = true
    }

  private fun getPrimerGooglePayButtonOrNull(context: Context): View? {
    val view = createPrimerGooglePayButton?.invoke(context) ?: return null
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
                              // Re-layout parent once PayButton is laid out
                              layout(view)
                            }
                          )
                        }
                      },
                      32L
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

  @ReactProp(name = "onPress")
  fun setOnPress(view: View, enabled: Boolean) {
    Log.e("TAG", "onPress called LOLOLOL")
      if (enabled) {
          view.setOnClickListener {
              // Use the React Context to send events to JS
              val reactContext = view.context as ReactContext
              reactContext.getJSModule(RCTModernEventEmitter::class.java)
                  .receiveEvent(view.id, "onPress", null)
          }
      } else {
          view.setOnClickListener(null)
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