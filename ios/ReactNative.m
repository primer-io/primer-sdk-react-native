#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(UniversalCheckoutRN, RCTViewManager)

RCT_EXTERN_METHOD(initialize: (NSDictionary *)data callback:(RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(dismissCheckout)

RCT_EXTERN_METHOD(loadDirectDebitView)

RCT_EXTERN_METHOD(loadPaymentMethods: (RCTResponseSenderBlock)callback)

@end
