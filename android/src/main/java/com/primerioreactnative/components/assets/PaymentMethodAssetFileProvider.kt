package com.primerioreactnative.components.assets

import com.facebook.react.bridge.ReactApplicationContext
import java.io.File

internal object PaymentMethodAssetFileProvider {

  private const val ASSETS_DIRECTORY = "primer-react-native-sdk"

  fun getFileForPaymentMethodAsset(
    context: ReactApplicationContext,
    path: String,
    type: AssetsManager.ImageColorType
  ): File {
    val directory = File(context.filesDir, ASSETS_DIRECTORY + File.separator + path)
    if (!directory.exists()) directory.mkdirs()
    val file = File(
      directory,
      type.name.lowercase()
    )
    if (!file.exists()) file.createNewFile()
    return file
  }
}
