package com.primerioreactnative

import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner

class PrimerRNViewModelStoreOwner : ViewModelStoreOwner {
    override val viewModelStore: ViewModelStore = ViewModelStore()
}
