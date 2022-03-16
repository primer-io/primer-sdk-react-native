//
//  RNTPrimer.m
//  primer-io-react-native
//
//  Created by Evangelos on 15/3/22.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(NativePrimer, RCTEventEmitter)

RCT_EXTERN_METHOD(configureWithSettings:(NSString *)settingsStr)

RCT_EXTERN_METHOD(configureWithTheme:(NSString *)themeStr)

RCT_EXTERN_METHOD(configureWithSettings:(NSString *)settingsStr theme:(NSString *)themeStr)

RCT_EXTERN_METHOD(showUniversalCheckout)

RCT_EXTERN_METHOD(showUniversalCheckoutWithClientToken:(NSString *)clientToken)

RCT_EXTERN_METHOD(setClientToken:(NSString *)clientToken)

RCT_EXTERN_METHOD(setResumeToken:(NSString *)resumeToken)

@end

