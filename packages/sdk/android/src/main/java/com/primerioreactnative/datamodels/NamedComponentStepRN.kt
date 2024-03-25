package com.primerioreactnative.datamodels

import kotlinx.serialization.Serializable

internal interface NamedComponentStep {
    val stepName: String
}

@Serializable
internal data class NamedComponentStepImpl(override val stepName: String) : NamedComponentStep
