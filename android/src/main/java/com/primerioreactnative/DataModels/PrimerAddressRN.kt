package com.primerioreactnative.DataModels

import kotlinx.serialization.Serializable

@Serializable
data class PrimerAddressRN(
  val line1: String,
  val line2: String,
  val postalCode: String,
  val city: String,
  val country: String,
)
