#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(PrimerRN, RCTViewManager)

RCT_EXTERN_METHOD(configureSettings: (NSString *)data)

RCT_EXTERN_METHOD(configureTheme: (NSString *)data)

RCT_EXTERN_METHOD(configureOnTokenizeSuccessCallback: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(configureOnVaultSuccessCallback: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(configureOnDismissCallback: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(configureOnPrimerErrorCallback: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(fetchSavedPaymentInstruments: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(initWith: (NSString *)data)

RCT_EXTERN_METHOD(resumeWith: (NSString *)data)

@end
