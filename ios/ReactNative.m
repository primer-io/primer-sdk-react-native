#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(PrimerRN, RCTViewManager)

RCT_EXTERN_METHOD(configureSettings: (NSString *)request)

RCT_EXTERN_METHOD(configureTheme: (NSString *)request)

RCT_EXTERN_METHOD(configureFlow: (NSString *)request)

RCT_EXTERN_METHOD(configureOnTokenizeSuccess: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(configureOnVaultSuccess: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(configureOnDismiss: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(configureOnPrimerError: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(fetchSavedPaymentInstruments: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(init: (NSString *)data)

RCT_EXTERN_METHOD(resume: (NSString *)data)

@end
