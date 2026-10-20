package com.primerioreactnative.components.manager

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

class ContentHeightChangeEvent(
    surfaceId: Int,
    viewTag: Int,
    private val heightDp: Float,
) : Event<ContentHeightChangeEvent>(surfaceId, viewTag) {
    override fun getEventName(): String = EVENT_NAME

    override fun getEventData(): WritableMap =
        Arguments.createMap().apply {
            putDouble("height", heightDp.toDouble())
        }

    companion object {
        const val EVENT_NAME = "topContentHeightChange"
        const val REGISTRATION_NAME = "onContentHeightChange"
    }
}
