package com.primerioreactnative.DataModels

import kotlinx.serialization.*


@Serializable
data class PrimerInitRequest(
  val intent: String,
  val token: String,
  val metadata: PrimerRequestMetadata? = null
) {

}

@Serializable
data class PrimerResumeRequest(
  val intent: String,
  val token: String,
  val metadata: PrimerRequestMetadata? = null
) {

}

@Serializable
data class PrimerRequestMetadata(
  val message: String?
)
