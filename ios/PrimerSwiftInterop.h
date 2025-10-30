@protocol PrimerDelegate;

#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

// When using frameworks the import is different.
#if __has_include("primer_io_react_native/primer_io_react_native-Swift.h")
#import <primer_io_react_native/primer_io_react_native-Swift.h>
#elif __has_include(<primer_io_react_native-Swift.h>)
#import <primer_io_react_native-Swift.h>
#endif
