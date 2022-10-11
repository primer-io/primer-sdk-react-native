//
//  RNTAssetsManager.m
//  primer-io-react-native
//
//  Created by Evangelos on 6/10/22.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNTPrimerHeadlessUniversalCheckoutAssetsManager, RCTEventEmitter)

RCT_EXTERN_METHOD(getPaymentMethodAsset:(NSString *)paymentMethodType
                      resolver:(RCTPromiseResolveBlock)resolver
                      rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(getPaymentMethodAssets:(RCTPromiseResolveBlock)resolver
                    rejecter:(RCTPromiseRejectBlock)rejecter)

@end
