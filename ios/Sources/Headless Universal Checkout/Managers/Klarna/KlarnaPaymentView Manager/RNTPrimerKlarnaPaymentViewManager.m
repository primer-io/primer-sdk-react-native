//
//  RNTPrimerKlarnaPaymentViewManager.m
//  primer-io-react-native
//
//  Created by Stefan Vrancianu on 08.04.2024.
//

#import <React/RCTViewManager.h>
#import "RNTPrimerKlarnaPaymentViewManager.h"
#import "RNTPrimerKlarnaPaymentContainerView.h"

@implementation RNTPrimerKlarnaPaymentViewManager

RCT_EXPORT_MODULE(PrimerKlarnaPaymentView)

RCT_EXPORT_VIEW_PROPERTY(onContentHeightChange, RCTDirectEventBlock)

static __weak UIView *primerKlarnaPaymentView = nil;
static CGFloat primerKlarnaPaymentViewContentHeight = 0;

+ (void)updatePrimerKlarnaPaymentView:(UIView *)view {
    primerKlarnaPaymentView = view;
    primerKlarnaPaymentViewContentHeight = 0;
}

+ (void)updatePrimerKlarnaPaymentViewContentHeight:(CGFloat)height {
    UIView *view = primerKlarnaPaymentView;
    // Klarna also resizes before load and at zero width; neither is the content height.
    if (view == nil || view.bounds.size.width <= 0 || height <= 0) {
        return;
    }
    primerKlarnaPaymentViewContentHeight = height;
    if ([view.superview isKindOfClass:[RNTPrimerKlarnaPaymentContainerView class]]) {
        [(RNTPrimerKlarnaPaymentContainerView *)view.superview contentHeightDidChange:height];
    }
}

+ (CGFloat)primerKlarnaPaymentViewContentHeight {
    return primerKlarnaPaymentViewContentHeight;
}

- (UIView *)view {
    RNTPrimerKlarnaPaymentContainerView *container = [RNTPrimerKlarnaPaymentContainerView new];
    UIView *view = primerKlarnaPaymentView;
    if (view != nil) {
        [container hostPaymentView:view];
    }
    return container;
}

@end
