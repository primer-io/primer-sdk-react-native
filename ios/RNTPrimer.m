//
//  RNTPrimer.m
//  primer-io-react-native
//
//  Created by Evangelos on 15/3/22.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(NativePrimer, RCTEventEmitter)

// MARK: - PRIMER SDK API

RCT_EXTERN_METHOD(configure:(NSString *)settingsStr resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(showUniversalCheckoutWithClientToken:(NSString *)clientToken resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(showVaultManagerWithClientToken: (NSString *)clientToken resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(showPaymentMethod:(NSString *)paymentMethodStr intent:(NSString *)intentStr clientToken:(NSString *)clientToken resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(dismiss)

RCT_EXTERN_METHOD(dispose)

// MARK: - HELPERS

RCT_EXTERN_METHOD(setImplementedRNCallbacks:(NSString *)implementedRNCallbacksStr resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

// MARK: - DECISION HANDLERS

// MARK: Tokenization Handlers

RCT_EXTERN_METHOD(handleTokenizationNewClientToken:(NSString *)newClientToken resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(handleTokenizationSuccess:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(handleTokenizationFailure:(NSString *)errorMessage resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

// MARK: Resume Handlers

RCT_EXTERN_METHOD(handleResumeWithNewClientToken:(NSString *)newClientToken resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(handleResumeSuccess:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(handleResumeFailure:(NSString *)errorMessage resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

// MARK: Payment Creation Handlers

RCT_EXTERN_METHOD(handlePaymentCreationAbort:(NSString *)errorMessage resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(handlePaymentCreationContinue:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

// MARK: Error Handler

RCT_EXTERN_METHOD(showErrorMessage:(NSString *)errorMessage resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

@end
