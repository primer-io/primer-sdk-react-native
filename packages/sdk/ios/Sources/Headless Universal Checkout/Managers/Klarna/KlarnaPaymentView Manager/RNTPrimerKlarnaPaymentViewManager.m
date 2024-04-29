//
//  RNTPrimerKlarnaPaymentViewManager.m
//  primer-io-react-native
//
//  Created by Stefan Vrancianu on 08.04.2024.
//

#import <React/RCTViewManager.h>
#import "RNTPrimerKlarnaPaymentViewManager.h"

@implementation RNTPrimerKlarnaPaymentViewManager

RCT_EXPORT_MODULE(PrimerKlarnaPaymentView)

static __weak UIView *primerKlarnaPaymentView = nil;

+ (void)updatePrimerKlarnaPaymentView:(UIView *)view {
    primerKlarnaPaymentView = view;
}

- (UIView *)view {
    return primerKlarnaPaymentView;
}

@end
