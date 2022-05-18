//
//  RNTPrimer.m
//  primer-io-react-native
//
//  Created by Evangelos on 15/3/22.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(NativePrimer, RCTEventEmitter)

RCT_EXTERN_METHOD(configure:(NSString *)settingsStr resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(showUniversalCheckoutWithClientToken: (NSString *)clientToken (RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(showVaultManagerWithClientToken: (NSString *)clientToken (RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(showPaymentMethod:(NSString *)paymentMethodStr intent:(NSString *)intentStr clientToken:(NSString *)clientToken resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(dismiss)

RCT_EXTERN_METHOD(setImplementedRNCallbacks:(NSString *)implementedRNCallbacksStr resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)


//RCT_EXTERN_METHOD(handleNewClientToken:(NSString *)clientToken resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)
//
//RCT_EXTERN_METHOD(handleError:(NSString *)errorStr resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)
//
//RCT_EXTERN_METHOD(handleSuccess:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

@end
