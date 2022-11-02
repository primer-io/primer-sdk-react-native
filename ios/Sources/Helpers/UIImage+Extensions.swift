//
//  UIImage+Extensions.swift
//  primer-io-react-native
//
//  Created by Evangelos on 6/10/22.
//

import UIKit

extension UIImage {

    func store(withName name: String) throws -> URL {
        guard let imageURL = NSURL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("\(name).png") else {
            let err = RNTNativeError(
                errorId: "native-ios",
                errorDescription: "Failed to create URL for asset",
                recoverySuggestion: nil)
            throw err
        }

        guard let pngData = self.pngData() else {
            let err = RNTNativeError(
                errorId: "native-ios",
                errorDescription: "Failed to get image's PNG data",
                recoverySuggestion: nil)
            throw err
        }

        try pngData.write(to: imageURL)
        return imageURL
    }
}
