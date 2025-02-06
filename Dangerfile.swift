import Danger
import Foundation

let danger = Danger()
let pr = danger.github.pullRequest
let isReleasePr = pr.head.ref.hasPrefix("release")
let allCreatedAndModifiedFiles = danger.git.modifiedFiles + danger.git.createdFiles
let sdkEditedFiles = allCreatedAndModifiedFiles
    .filter { $0.name != "Dangerfile.swift" }
    .filter { !$0.hasPrefix("packages/example/ios/") }

// You can use these functions to send feedback:
// message("Highlight something in the table")
// warn("Something pretty bad, but not important enough to fail the build")
// fail("Something that must be changed")
// markdown("Free-form markdown that goes under the table, so you can do whatever.")

// MARK: - Copyright

// Checks whether new files have "Copyright / Created by" mentions

let swiftFilesWithCopyright = sdkEditedFiles.filter {
    $0.fileType == .swift &&
        danger.utils.readFile($0).contains("//  Created by")
}

// if swiftFilesWithCopyright.count > 0 {
//    let files = swiftFilesWithCopyright.joined(separator: ", ")
//    warn("In Danger we don't include copyright headers, found them in: \(files)")
// }

// MARK: - PR Contains Tests

// Raw check based on created / updated files containing `import XCTest`

let swiftTestFilesContainChanges = sdkEditedFiles.filter {
    $0.fileType == .swift &&
        danger.utils.readFile($0).contains("import XCTest")
}

warn("swiftTestFilesContainChanges: " + swiftTestFilesContainChanges)

if swiftTestFilesContainChanges.isEmpty {
    warn("This PR doesn't seem to contain any updated Unit Test for Swift 🤔. Please consider double checking it 🙏")
}

// MARK: - SwiftLint

// Use a different path for SwiftLint

let filesToLint = sdkEditedFiles.filter { $0.fileType == .swift }
SwiftLint.lint(.files(filesToLint), inline: true, configFile: "packages/example/ios/.swiftlint.yml")

// MARK: - Check Coverage

// Coverage.xcodeBuildCoverage(.derivedDataFolder("Build"),
//                            minimumCoverage: 30)
