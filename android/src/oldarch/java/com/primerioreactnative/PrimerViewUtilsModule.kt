package com.primerioreactnative

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = PrimerViewUtilsModule.NAME)
class PrimerViewUtilsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val implementation by lazy {
        PrimerViewUtilsImpl(reactContext)
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun getBottomSafeAreaInset(promise: Promise) {
        implementation.getBottomSafeAreaInset(promise)
    }

    companion object {
        const val NAME = "PrimerViewUtils"
    }
}
