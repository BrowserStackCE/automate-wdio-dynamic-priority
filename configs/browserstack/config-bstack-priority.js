require("dotenv").config();

// 1. Natively import the customer's fully configured setups.
//    This automatically inherits their mainConfig, custom before hooks, and precise device settings.
const androidConfig = require("./config-bstack-mobile-android.js").config;
const iosConfig = require("./config-bstack-mobile-latest.js").config;

const device1Specs = JSON.parse(process.env.DEVICE1_SPECS || "[]");
const device2Specs = JSON.parse(process.env.DEVICE2_SPECS || "[]");
const buildName = process.env.BROWSERSTACK_BUILD_NAME || "WINONA-Priority-Run";

const activeCapabilities = [];

// 2. DEVICE 1: Clone Android capability and inject priority tests
if (device1Specs.length > 0) {
  const androidCap = JSON.parse(JSON.stringify(androidConfig.capabilities[0]));

  androidCap.specs = device1Specs;
  androidCap["wdio:maxInstances"] = 5;

  if (androidCap["bstack:options"]) {
    androidCap["bstack:options"].sessionName = "Device 1 Priority (Android)";
    androidCap["bstack:options"].buildName = buildName;
  }

  activeCapabilities.push(androidCap);
}

// 3. DEVICE 2: Clone iOS capability and inject overflow tests
if (device2Specs.length > 0) {
  const iosCap = JSON.parse(JSON.stringify(iosConfig.capabilities[0]));

  iosCap.specs = device2Specs;
  iosCap["wdio:maxInstances"] = 5;

  if (iosCap["bstack:options"]) {
    iosCap["bstack:options"].sessionName = "Device 2 Overflow (iOS)";
    iosCap["bstack:options"].buildName = buildName;
  }

  activeCapabilities.push(iosCap);
}

// 4. Export the finalized configuration.
//    By spreading iosConfig, we retain their exact hooks and base settings.
exports.config = {
  ...iosConfig,
  specs: [...device1Specs, ...device2Specs],
  capabilities: activeCapabilities,
};
