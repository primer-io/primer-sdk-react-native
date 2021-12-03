package com.primerioreactnative.utils

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

    println("1")

    val callback = mCallback ?: return

    println("2")

    val next = mQueue.poll() ?: return

    println("3")

    callback.invoke(next)

    println("4")

    clear()
  }

  fun clear() {
    mQueue.clear()
    mCallback = null
  }
}

