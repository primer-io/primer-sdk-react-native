//
//  RNTPrimerCardNumberInputElementManager.m
//  primer-io-react-native
//
//  Created by Evangelos on 3/3/22.
//

#import <React/RCTViewManager.h>
@import PrimerSDK;

@interface RNTPrimerCardNumberInputElementManager : RCTViewManager
@end

@implementation RNTPrimerCardNumberInputElementManager

RCT_EXPORT_MODULE(PrimerCardNumberEditText)

- (UIView *)view
{
    return [[PrimerCardNumberInputElement alloc] init];
}

@end
