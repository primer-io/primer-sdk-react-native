//
//  RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager.m
//  primer-io-react-native
//
//  Created by Faisal Iqbal on 15.12.2023.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager, RCTEventEmitter)

RCT_EXTERN_METHOD(configure:(NSString *)paymentMethodTypeStr resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(submit:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(cleanUp:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end