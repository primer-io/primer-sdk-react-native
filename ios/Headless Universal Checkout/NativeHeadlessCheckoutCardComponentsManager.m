//
//  NativeHeadlessCheckoutCardComponentsManager.m
//  primer-io-react-native
//
//  Created by Evangelos on 21/6/22.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(NativeHeadlessCheckoutCardComponentsManager, RCTEventEmitter)

RCT_EXTERN_METHOD(listRequiredInputElementTypes:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(setInputElementsWithTags:(NSArray* __nonnull)tag)

RCT_EXTERN_METHOD(tokenize)

@end

