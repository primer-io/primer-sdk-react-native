package com.primerioreactnative.components.manager.googlePay

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.google.android.gms.wallet.button.ButtonConstants

internal object PrimerGooglePayButtonOptionsMapping {
  fun getOptions(): Map<String, Map<String, Int>> {
    val themes = hashMapOf<String, Int>()
    themes["Dark"] = ButtonConstants.ButtonTheme.DARK
    themes["Light"] = ButtonConstants.ButtonTheme.LIGHT

    val types = hashMapOf<String, Int>()
    types["Book"] = ButtonConstants.ButtonType.BOOK
    types["Buy"] = ButtonConstants.ButtonType.BUY
    types["Checkout"] = ButtonConstants.ButtonType.CHECKOUT
    types["Donate"] = ButtonConstants.ButtonType.DONATE
    types["Order"] = ButtonConstants.ButtonType.ORDER
    types["Pay"] = ButtonConstants.ButtonType.PAY
    types["Plain"] = ButtonConstants.ButtonType.PLAIN
    types["Subscribe"] = ButtonConstants.ButtonType.SUBSCRIBE

    return hashMapOf("Themes" to themes, "Types" to types)
  }
}

class PrimerGooglePayButtonConstantsModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getConstants(): Map<String, Any> = PrimerGooglePayButtonOptionsMapping.getOptions()

  override fun getName() = NAME

  companion object {
    private const val NAME = "PrimerGooglePayButtonConstants"
  }
}
