package com.primerioreactnative.huc.assets

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import com.facebook.react.bridge.ReactApplicationContext
import java.io.File
import java.io.FileOutputStream
import java.util.*

internal object AssetsManager {

  private const val ASSETS_DIRECTORY = "primer-sdk"
  private const val COMPRESS_QUALITY = 100

  fun drawableToBitmap(drawable: Drawable): Bitmap {
    if (drawable is BitmapDrawable) {
      return drawable.bitmap
    }

    val bitmap = Bitmap.createBitmap(
      drawable.intrinsicWidth,
      drawable.intrinsicHeight,
      Bitmap.Config.ARGB_8888
    )
    val canvas = Canvas(bitmap)
    drawable.setBounds(0, 0, canvas.width, canvas.height)
    drawable.draw(canvas)
    return bitmap
  }

  fun saveBitmapToFile(
    file: File,
    bitmap: Bitmap,
    format: Bitmap.CompressFormat = Bitmap.CompressFormat.PNG,
  ) {

    FileOutputStream(file).use {
      bitmap.compress(format, COMPRESS_QUALITY, it)
      it.close()
    }
  }

  fun getFile(context: ReactApplicationContext, path: String): File {
    val directory = File(context.filesDir, path)
    if (!directory.exists()) directory.mkdirs()
    val file = File(
      context.filesDir,
      ASSETS_DIRECTORY + File.pathSeparator + path.toLowerCase(Locale.ROOT)
    )
    if (!file.exists()) file.createNewFile()
    return file
  }

}
