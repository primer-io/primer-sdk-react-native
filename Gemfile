source "https://rubygems.org"

# You may use http://rbenv.org/ or https://rvm.io/ to install and use this version
ruby ">= 2.7.0"

gem "fastlane"

plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'PluginFile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
