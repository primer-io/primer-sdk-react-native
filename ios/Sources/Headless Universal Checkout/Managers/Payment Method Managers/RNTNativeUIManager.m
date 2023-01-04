//
//  NativeUIManager.m
//  primer-io-react-native
//
//  Created by Evangelos on 7/10/22.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager, RCTEventEmitter)

// MARK: - API

RCT_EXTERN_METHOD(configure: (NSString *)paymentMethod resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(showPaymentMethod:(NSString *)intentStr resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

@end
