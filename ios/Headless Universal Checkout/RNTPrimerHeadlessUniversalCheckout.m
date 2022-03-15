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

RCT_EXTERN_METHOD(showPaymentMethod:(NSString *)paymentMethodTypeStr)

RCT_EXTERN_METHOD(listAvailableAssets:(RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(getAssetFor:(NSString *)assetBrand
                  assetType:(NSString *)assetType
                  errorCallback:(RCTResponseSenderBlock)errorCallback
                  successCallback: (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(getAssetForPaymentMethodType:(NSString *)paymentMethodTypeStr
                  assetType:(NSString *)assetTypeStr
                  errorCallback:(RCTResponseSenderBlock)errorCallback
                  successCallback: (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(getAssetForCardNetwork:(NSString *)cardNetworkStr
                  assetType:(NSString *)assetTypeStr
                  errorCallback:(RCTResponseSenderBlock)errorCallback
                  successCallback: (RCTResponseSenderBlock)successCallback)


@end
