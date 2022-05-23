package com.primerioreactnative.datamodels

import kotlinx.serialization.Serializable

@Serializable
enum class PrimerPaymentMethodTypeRN {
  Any,
  Klarna,
  Card,
  PayPal,
  GooglePay,
  ApplePay,
  GoCardless,
}
