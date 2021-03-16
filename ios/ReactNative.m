#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(UniversalCheckoutRN, RCTViewManager)

RCT_EXTERN_METHOD(initialize: (NSDictionary *)data)

RCT_EXTERN_METHOD(setEventCallback: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(setOnViewDismissedCallback: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(dismissCheckout)

RCT_EXTERN_METHOD(loadDirectDebitView)

RCT_EXTERN_METHOD(loadPaymentMethods: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(setTheme: (NSDictionary *)data)

RCT_EXTERN_METHOD(setDirectDebitDetails: (NSDictionary *)data)

@end
