package com.primerioreactnative.datamodels

import kotlinx.serialization.*

@Serializable
data class PrimerResumeRequest(
  val error: Boolean,
  val token: String? = null,
)
