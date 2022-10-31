package com.primerioreactnative.components.assets

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import com.facebook.react.bridge.ReactApplicationContext
import java.io.File
import java.io.FileOutputStream

internal object AssetsManager {

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

  internal enum class ImageColorType {
    COLORED,
    DARK,
    LIGHT
  }
}
