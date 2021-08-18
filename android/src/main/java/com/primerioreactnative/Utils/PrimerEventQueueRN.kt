package com.primerioreactnative.Utils

import com.facebook.react.bridge.Callback
import java.util.*

class PrimerEventQueueRN {
  private var mQueue: Deque<String> = ArrayDeque()
  private var mCallback: Callback? = null

  fun addRequestAndPoll(request: String) {
    mQueue.add(request)
    poll()
  }

  fun poll(cb: Callback? = null) {
    if (cb != null) mCallback = cb

    val callback = mCallback ?: return

    val next = mQueue.poll() ?: return

    callback.invoke(next)

    mCallback = null
  }

  fun clear() {
    mQueue.clear()
    mCallback = null
  }
}

