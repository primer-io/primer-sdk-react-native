require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "primer-io-react-native"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "10.0" }
  s.source       = { :git => "https://github.com/primer-io/primer-sdk-react-native.git", :tag => "#{s.version}" }


  s.source_files = "ios/**/*.{h,m,mm,swift}"

  s.dependency "React-Core"
<<<<<<< HEAD
  s.dependency "PrimerSDK", "2.12.0"
=======
  s.dependency "PrimerSDK", "2.14.0"
>>>>>>> feature/DEVX-409_HUC-Example-app
end
