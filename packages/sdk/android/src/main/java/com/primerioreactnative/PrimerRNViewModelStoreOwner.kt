package com.primerioreactnative

import android.util.Log
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.ViewModelStore

class PrimerRNViewModelStoreOwner : ViewModelStoreOwner {
  override val viewModelStore: ViewModelStore = ViewModelStore()
}
