# crutch for ruby (need to fix version to >=2.6)
rvm use 2.7.5

# Create the test app
npx react-native init testapp --version 0.70.8

# Install primer SDK
yarn --cwd testapp add @primer-io/react-native

# Install pods
cd testapp/ios ; npx pod-install ; cd ..

# Move compat testing files 
cp -r ../compat-testing/* ./

# Install deps
yarn add --dev \
	appium appium-xcuitest-driver \
	appium-uiautomator2-driver \
	mocha-tags \
	@wdio/appium-service \
	@wdio/browserstack-service \
	@wdio/cli \
	@wdio/local-runner \
	@wdio/mocha-framework \
	@wdio/spec-reporter \
	wdio-json-reporter \
	@babel/cli \
	@babel/preset-env \
	@babel/register \
	typescript \
	ts-node

# Build bundle and run once to link everything together
npx react-native run-ios

# Kill any running appium server
pkill -f appium

# Start appium server
nohup npx appium & 

# Run tests
npx wdio test-config/wdio.ios.conf.js
