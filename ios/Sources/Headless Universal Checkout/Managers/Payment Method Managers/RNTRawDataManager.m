//
//  RNTPrimerHeadlessUniversalCheckoutRawDataManager.m
//  primer-io-react-native
//
//  Created by Evangelos on 3/8/22.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNTPrimerHeadlessUniversalCheckoutRawDataManager, RCTEventEmitter)

RCT_EXTERN_METHOD(configure:(NSString *)paymentMethodTypeStr resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(listRequiredInputElementTypes:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setRawData:(NSString *)rawDataStr resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(submit:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(cleanUp:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
