//
//  RNTPrimer.m
//  primer-io-react-native
//
//  Created by Evangelos on 15/3/22.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(NativePrimer, RCTEventEmitter)

RCT_EXTERN_METHOD(configureWithSettings:(NSString *)settingsStr resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(configureWithTheme:(NSString *)themeStr resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(showUniversalCheckout:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(showUniversalCheckoutWithClientToken:(NSString *)clientToken resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(showVaultManager:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(showVaultManager:(NSString *)clientToken resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)



RCT_EXTERN_METHOD(handleNewClientToken:(NSString *)clientToken resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(handleError:(NSString *)errorStr resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(handleSuccess:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(setImplementedRNCallbacks:(NSString *)implementedRNCallbacksStr resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)






RCT_EXTERN_METHOD(showPaymentMethod:(NSString *)clientToken paymentMethodStr:(NSString *)paymentMethodStr intentStr:(NSString *)intentStr resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

@end

