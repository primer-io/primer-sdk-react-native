//
//  RNTPrimerHeadlessUniversalCheckout.m
//  primer-io-react-native
//
//  Created by Evangelos on 8/3/22.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(PrimerHeadlessUniversalCheckout, RCTEventEmitter)

RCT_EXTERN_METHOD(startWithClientToken:(NSString *)clientToken settingsStr:(NSString *)settingsStr errorCallback:(RCTResponseSenderBlock)errorCallback successCallback: (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(resumeWithClientToken:(NSString *)resumeToken)

RCT_EXTERN_METHOD(showPaymentMethod:(NSString *)paymentMethodTypeStr
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(getAssetForPaymentMethodType:(NSString *)paymentMethodTypeStr
                  assetType:(NSString *)assetTypeStr
                  errorCallback:(RCTResponseSenderBlock)errorCallback
                  successCallback: (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(getAssetForCardNetwork:(NSString *)cardNetworkStr
                  assetType:(NSString *)assetTypeStr
                  errorCallback:(RCTResponseSenderBlock)errorCallback
                  successCallback: (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(disposePrimerHeadlessUniversalCheckout)

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


@end
