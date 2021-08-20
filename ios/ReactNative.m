#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(PrimerRN, RCTViewManager)

RCT_EXTERN_METHOD(configureSettings: (NSString *)request)

RCT_EXTERN_METHOD(configureTheme: (NSString *)request)

RCT_EXTERN_METHOD(configureIntent: (NSString *)request)

RCT_EXTERN_METHOD(configureOnTokenizeSuccess: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(configureOnVaultSuccess: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(configureOnDismiss: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(configureOnPrimerError: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(fetchSavedPaymentInstruments: (NSString)token with: (RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(initialize: (NSString *)data)

RCT_EXTERN_METHOD(resume: (NSString *)data)

RCT_EXTERN_METHOD(dispose)

@end
