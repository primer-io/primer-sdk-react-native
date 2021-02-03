package com.primerioreactnative

import com.facebook.react.bridge.Callback
import io.primer.android.UniversalCheckout
import io.primer.android.events.CheckoutEvent
import java.util.*

class CheckoutEventListener : UniversalCheckout.EventListener {
  private var mQueue: Deque<CheckoutEvent> = ArrayDeque()
  private var mCallback: Callback? = null

  override fun onCheckoutEvent(e: CheckoutEvent) {
    mQueue.add(e)
    poll()
  }

  fun poll(cb: Callback? = null) {
    if (cb != null) {
      mCallback = cb
    }

    mCallback?.let { callback ->
      mQueue.poll()?.let { next ->
        callback.invoke(EventSerializer.serialize(next))
        mCallback = null
      }
    }
  }

  fun clear() {
    mQueue.clear()
    mCallback = null
  }
}
