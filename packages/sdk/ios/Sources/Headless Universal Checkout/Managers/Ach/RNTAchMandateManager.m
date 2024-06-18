//
//  RNTAchMandateManager.m
//  primer-io-react-native
//
//  Created by Flaviu Dunca on 18.06.2024.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNTAchMandateManager, NSObject)

RCT_EXTERN_METHOD(acceptMandate:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(declineMandate:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
