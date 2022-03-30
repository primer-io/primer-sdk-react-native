package com.primerioreactnative.datamodels

sealed class PrimerEventsRN(val string: String) {
  object OnClientTokenCallback: PrimerEventsRN("onClientTokenCallback")
  object OnClientSessionActions: PrimerEventsRN("onClientSessionActions")
  object OnTokenizeSuccessCallback: PrimerEventsRN("onTokenizeSuccessCallback")
  object OnResumeSuccess: PrimerEventsRN("onResumeSuccess")
  object OnCheckoutDismissed: PrimerEventsRN("onCheckoutDismissed")
  object OnError: PrimerEventsRN("onError")
  object OnVaultSuccess: PrimerEventsRN("onVaultSuccess")
}
