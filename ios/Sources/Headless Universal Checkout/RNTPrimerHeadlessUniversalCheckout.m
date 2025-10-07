//
//  RNTPrimerHeadlessUniversalCheckout.m
//  primer-io-react-native
//
//  Created by Evangelos on 8/3/22.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(PrimerHeadlessUniversalCheckout, RCTEventEmitter)

RCT_EXTERN_METHOD(startWithClientToken:(NSString *)clientToken
                  settingsStr:(NSString *)settingsStr
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter: (RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(cleanUp:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

// MARK: - DECISION HANDLERS

// MARK: Tokenization & Resume Handlers

RCT_EXTERN_METHOD(handleTokenizationNewClientToken:(NSString *)newClientToken resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(handleResumeWithNewClientToken:(NSString *)newClientToken resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(handleCompleteFlow:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

// MARK: Payment Creation Handlers

RCT_EXTERN_METHOD(handlePaymentCreationAbort:(NSString *)errorMessage resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(handlePaymentCreationContinue:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

// MARK: - HELPERS

RCT_EXTERN_METHOD(setImplementedRNCallbacks:(NSString *)implementedRNCallbacksStr resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)


@end
