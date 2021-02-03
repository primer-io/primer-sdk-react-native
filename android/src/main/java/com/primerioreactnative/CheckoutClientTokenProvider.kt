package com.primerioreactnative

import io.primer.android.ClientTokenProvider

class CheckoutClientTokenProvider(private val token: String) : ClientTokenProvider {
  override fun createToken(callback: (String) -> Unit) {
    callback(token)
  }
}
