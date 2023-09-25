require("dotenv").config();
const { config } = require("./wdio.shared.conf");

// BROWSERSTACK
config.user = process.env.BROWSERSTACK_USERNAME;
config.key = process.env.BROWSERSTACK_ACCESS_KEY;
config.services = ["browserstack"];

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
    "appium:deviceName": "iPhone 14 Plus",
    "appium:automationName": "XCUITest",
    "appium:app": process.env.BROWSERSTACK_APP_ID,
  },
];

exports.config = config;

