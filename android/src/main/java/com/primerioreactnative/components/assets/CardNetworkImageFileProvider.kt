package com.primerioreactnative.components.assets

import com.facebook.react.bridge.ReactApplicationContext
import java.io.File

internal object CardNetworkImageFileProvider {
    private const val ASSETS_DIRECTORY = "primer-react-native-sdk"

    fun getFileForCardNetworkAsset(
        context: ReactApplicationContext,
        path: String,
    ): File {
        val directory = File(context.filesDir, ASSETS_DIRECTORY)
        if (!directory.exists()) directory.mkdirs()
        val file =
            File(
                directory,
                path.lowercase(),
            )
        if (!file.exists()) file.createNewFile()
        return file
    }
}
