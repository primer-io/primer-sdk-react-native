import UIKit

@objc public class RNTPrimerViewUtils: NSObject {

  @objc public static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc public func getBottomSafeAreaInset(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      let bottom = UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .first?
        .windows
        .first { $0.isKeyWindow }?
        .safeAreaInsets.bottom ?? 0
      resolve(bottom)
    }
  }
}
