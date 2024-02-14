package com.primerioreactnative.components.manager.klarna

import android.os.Bundle
import android.util.Log
import android.view.Choreographer
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactPropGroup
import io.primer.android.components.presentation.paymentMethods.nativeUi.klarna.PrimerKlarnaPaymentView
import java.lang.ref.WeakReference

class PrimerKlarnaPaymentViewManager(private val reactContext: ReactApplicationContext) :
    ViewGroupManager<ViewGroup>() {
  override fun getName() = REACT_CLASS

  private var propWidth: Int? = null
  private var propHeight: Int? = null

  override fun createViewInstance(reactContext: ThemedReactContext) = FrameLayout(reactContext)

  override fun getCommandsMap() = mapOf("create" to COMMAND_CREATE)

  override fun receiveCommand(root: ViewGroup, commandId: String, args: ReadableArray?) {
    super.receiveCommand(root, commandId, args)
    val reactNativeViewId = requireNotNull(args).getInt(0)

    when (commandId.toInt()) {
      COMMAND_CREATE -> createFragment(root, reactNativeViewId)
    }
  }

  @ReactPropGroup(names = ["width", "height"], customType = "Style")
  fun setStyle(view: ViewGroup, index: Int, value: Int) {
    if (index == 0) propWidth = value
    if (index == 1) propHeight = value
  }

  private fun createFragment(root: ViewGroup, reactNativeViewId: Int) {
    val parentView = root.findViewById<ViewGroup>(reactNativeViewId)
    setupLayout(parentView)
    val activity = reactContext.currentActivity as FragmentActivity
    activity
        .supportFragmentManager
        .beginTransaction()
        .replace(
            reactNativeViewId,
            PrimerKlarnaViewContainerFragment(),
            reactNativeViewId.toString()
        )
        .commit()
  }

  private fun setupLayout(view: View) {
    Choreographer.getInstance()
        .postFrameCallback(
            object : Choreographer.FrameCallback {
              override fun doFrame(frameTimeNanos: Long) {
                layout(view)
                view.viewTreeObserver.dispatchOnGlobalLayout()
                Choreographer.getInstance().postFrameCallback(this)
              }
            }
        )
  }

  private fun layout(view: View) {
    val oldX = view.getX().toInt()
    val oldY = view.getY().toInt()
    val parent = (view.parent as? View)
    val fallbackWidth = parent?.width ?: Int.MAX_VALUE
    val fallbackHeight = parent?.height ?: Int.MAX_VALUE
    val width = requireNotNull(propWidth ?: fallbackWidth)
    val height = requireNotNull(propHeight ?: fallbackHeight)

    view.measure(
        View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
        View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY)
    )

    view.layout(oldX, oldY, oldX + width, oldY + height)
  }

  companion object {
    private const val COMMAND_CREATE = 1

    fun updatePrimerKlarnaPaymentView(view: PrimerKlarnaPaymentView) {
      PrimerKlarnaViewContainerFragment.updatePrimerKlarnaPaymentView(view)
    }

    const val REACT_CLASS = "PrimerKlarnaPaymentView"
  }
}

class PrimerKlarnaViewContainerFragment : Fragment() {
  companion object {
    private var primerKlarnaPaymentView: WeakReference<PrimerKlarnaPaymentView?> =
        WeakReference(null)
      private set

    fun updatePrimerKlarnaPaymentView(view: PrimerKlarnaPaymentView) {
      primerKlarnaPaymentView = WeakReference(view)
    }
  }

  override fun onCreateView(
      inflater: LayoutInflater,
      container: ViewGroup?,
      savedInstanceState: Bundle?
  ): View {
    Log.e("PrimerKlarnaViewContainerFragment", "Creating view: ${primerKlarnaPaymentView.get()}")
    super.onCreateView(inflater, container, savedInstanceState)
    return primerKlarnaPaymentView.get()
        ?: TextView(requireContext()).apply { text = "Error loading Klarna payment view" }
  }
}
