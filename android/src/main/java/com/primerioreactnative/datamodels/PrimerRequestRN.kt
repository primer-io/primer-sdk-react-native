package com.primerioreactnative.datamodels

import kotlinx.serialization.*

@Serializable
data class PrimerResumeRequest(
  val error: String? = null,
  val token: String? = null,
)
