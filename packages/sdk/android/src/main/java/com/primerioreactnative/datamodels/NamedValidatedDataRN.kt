package com.primerioreactnative.datamodels

import kotlinx.serialization.Serializable

// TODO TWS-94: maybe rename to NamedCollectedData
@Serializable
internal open class NamedValidatedData(val name: String)