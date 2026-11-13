//
//  RNTPrimerKlarnaPaymentContainerView.m
//  primer-io-react-native
//

#import "RNTPrimerKlarnaPaymentContainerView.h"
#import "RNTPrimerKlarnaPaymentViewManager.h"

@interface RNTPrimerKlarnaPaymentContainerView ()
@property (nonatomic, readonly, nullable) UIView *paymentView;
@end

@implementation RNTPrimerKlarnaPaymentContainerView {
  CGFloat _contentHeight;
  CGFloat _sentHeight;
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    self.clipsToBounds = YES;
  }
  return self;
}

- (UIView *)paymentView {
  return self.subviews.firstObject;
}

- (void)hostPaymentView:(UIView *)paymentView {
  [self addSubview:paymentView];
  _contentHeight = [RNTPrimerKlarnaPaymentViewManager primerKlarnaPaymentViewContentHeight];
  [self setNeedsLayout];
}

- (void)layoutSubviews {
  [super layoutSubviews];
  self.paymentView.frame = self.bounds;
  [self sendContentHeightIfNeeded];
}

- (void)didMoveToWindow {
  [super didMoveToWindow];
  [self sendContentHeightIfNeeded];
}

- (void)contentHeightDidChange:(CGFloat)height {
  _contentHeight = height;
  [self sendContentHeightIfNeeded];
}

- (void)sendContentHeightIfNeeded {
  if (self.window == nil || self.bounds.size.width <= 0 || _contentHeight == _sentHeight ||
      self.onContentHeightChange == nil) {
    return;
  }
  _sentHeight = _contentHeight;
  self.onContentHeightChange(@{@"height" : @(_contentHeight)});
}

@end
