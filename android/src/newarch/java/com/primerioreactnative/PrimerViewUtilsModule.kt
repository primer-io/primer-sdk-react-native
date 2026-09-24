package com.primerioreactnative

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = PrimerViewUtilsModule.NAME)
class PrimerViewUtilsModule(reactContext: ReactApplicationContext) :
    NativePrimerViewUtilsSpec(reactContext) {

    private val implementation by lazy {
        PrimerViewUtilsImpl(reactContext)
    }

    override fun getName(): String = NAME

    override fun getBottomSafeAreaInset(promise: Promise) {
        implementation.getBottomSafeAreaInset(promise)
    }

    override fun isFontAvailable(fontFamily: String, promise: Promise) {
        implementation.isFontAvailable(fontFamily, promise)
    }

    companion object {
        const val NAME = "PrimerViewUtils"
    }
}
