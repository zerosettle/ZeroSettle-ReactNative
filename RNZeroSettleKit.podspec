require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "RNZeroSettleKit"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  # iOS 17.0+ required for ZeroSettleKit's SwiftUI features
  s.platforms    = { :ios => "17.0" }
  s.source       = { :git => "https://github.com/ZeroSettle/ZeroSettle-ReactNative.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  s.private_header_files = "ios/**/*.h"

  # Swift version
  s.swift_version = "5.9"

  # Required frameworks
  s.frameworks = "UIKit", "SwiftUI"

  # ZeroSettleKit via Swift Package Manager
  if defined?(:spm_dependency)
    spm_dependency(s,
      url: 'https://github.com/zerosettle/ZeroSettleKit.git',
      requirement: { kind: 'upToNextMajorVersion', minimumVersion: '1.0.24' },
      products: ['ZeroSettleKit']
    )
  end

  install_modules_dependencies(s)
end
