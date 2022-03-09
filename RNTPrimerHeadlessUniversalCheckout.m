//
//  RNTPrimerHeadlessUniversalCheckout.m
//  primer-io-react-native
//
//  Created by Evangelos on 8/3/22.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(PrimerHeadlessUniversalCheckout, RCTEventEmitter)

RCT_EXTERN_METHOD(startWithClientToken:(NSString *)clientToken settingsStr:(NSString *)settingsStr errorCallback:(RCTResponseErrorBlock)errorCallback successCallback: (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(showPaymentMethod:(NSString *)paymentMethodTypeStr)

@end
