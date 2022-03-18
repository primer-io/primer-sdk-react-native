#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import <React/RCTView.h>

@interface RCT_EXTERN_MODULE(PrimerHeadlessUniversalCheckoutCardFormUIManager, NSObject)

RCT_EXTERN_METHOD(setInputElements:(NSString *)inputElements errorCallback: (RCTResponseSenderBlock)errorCallback successCallback: (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(tokenize)

RCT_EXTERN_METHOD(addInput:(NSNumber* __nonnull)tag)

@end
