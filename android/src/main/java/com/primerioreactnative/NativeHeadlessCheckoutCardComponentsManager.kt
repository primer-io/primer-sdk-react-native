package com.primerioreactnative

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.uimanager.IllegalViewOperationException
import com.facebook.react.uimanager.UIManagerModule
import com.primerioreactnative.huc.input.PrimerRNRequiredInputElement
import com.primerioreactnative.utils.convertJsonToMap
import io.primer.android.ExperimentalPrimerApi
import io.primer.android.components.manager.PrimerCardManager
import io.primer.android.components.manager.PrimerUniversalCheckoutCardManagerInterface
import io.primer.android.components.ui.widgets.elements.PrimerInputElement
import org.json.JSONArray
import org.json.JSONObject

@ExperimentalPrimerApi
class NativeHeadlessCheckoutCardComponentsManager(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "NativeHeadlessCheckoutCardComponentsManager"

  private var cardManager: PrimerUniversalCheckoutCardManagerInterface
  private val listener by lazy { PrimerRNCardManagerListener() }

  init {
    listener.sendEvent = { eventName, paramsJson -> sendEvent(eventName, paramsJson) }
    cardManager = PrimerCardManager.newInstance()
    cardManager.setCardManagerListener(listener)
  }

  @ReactMethod
  fun listRequiredInputElementTypes(promise: Promise) {
    promise.resolve(
      convertJsonToMap(
        JSONObject().apply {
          put(
            "requiredInputElementTypes",
            JSONArray(
              cardManager.getRequiredInputElementTypes().orEmpty()
                .filter { PrimerRNRequiredInputElement.safeValueOf(it) != PrimerRNRequiredInputElement.UNNOWN }
                .map { PrimerRNRequiredInputElement.safeValueOf(it).field })
          )
        }
      ))
  }

  @ReactMethod
  fun setInputElementsWithTags(tags: ReadableArray) {
    cardManager.setInputElements(listOf())
    val uiManager = reactContext.getNativeModule(UIManagerModule::class.java)
    val inputElements = mutableListOf<PrimerInputElement>()
    uiManager.addUIBlock {
      for (tag in tags.toArrayList()) {
        try {
          val inputElement =
            uiManager.resolveView(tag.toString().toDouble().toInt()) as? PrimerInputElement
          inputElement?.let { inputElements.add(it) }
        } catch (ignored: IllegalViewOperationException) {

        }
      }
      cardManager.setInputElements(inputElements)
    }
  }

  @ReactMethod
  fun tokenize() {
    cardManager.tokenize()
  }

  private fun sendEvent(name: String, data: JSONObject?) {
    val params = prepareData(data)
    reactApplicationContext.getJSModule(
      DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
    ).emit(name, params)
  }

  private fun prepareData(data: JSONObject?): WritableMap {
    return data?.let { convertJsonToMap(data) } ?: Arguments.createMap()
  }
}
