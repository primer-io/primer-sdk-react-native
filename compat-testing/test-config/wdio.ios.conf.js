const path = require("path");
const { config } = require("./wdio.shared.conf");

// PORT
config.port = 4723;

// SPECS
config.specs = [
  "./test/specs/*spec.js",
  "./test/specs/**/*spec.js",
  "../test/specs/*spec.js",
  "../test/specs/**/*spec.js",
];

// CAPABILITIES
config.capabilities = [
  {
    platformName: "IOS",
    "appium:platformVersion": "16.2",
    "appium:deviceName": "iPhone 14",
    "appium:automationName": "XCUITest",
    "appium:app": "/var/tmp/testapp.xcarchive/Products/Applications/testapp.app"
  },
];

config.services = [
  [
    "appium",
    {
      args: {
        address: "localhost",
        port: 4723,
      },
      logPath: "./",
    },
  ],
];

exports.config = config;
