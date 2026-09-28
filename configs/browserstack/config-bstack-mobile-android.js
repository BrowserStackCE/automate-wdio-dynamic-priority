require("dotenv").config();
const customCommands = require("../../shared/commands");
const { mainConfig } = require("../wdio.conf.js");
const { BSTACK_PROTOCOL } = require("../config.js");
const chai = require("chai");

const currentBuildName = `WINONA-Android-${new Date()
  .toISOString()
  .slice(0, 16)
  .replace(":", "-")}`;

const configuration = {
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,
  capabilities: [
    {
      browserName: "chrome",
      "bstack:options": {
        local: false,
        projectName: "WINONA Product",
        sessionName: "Android Tests",
        buildName: currentBuildName,
        buildTag: process.env.BUILD_TAG,
        networkLogs: true,
        appiumVersion: "2.4.1",
        disableCorsRestrictions: true,
        interactiveDebugging: true,
        idleTimeout: 300,
        timezone: "UTC",
        selfHeal: false,
        platformName: "Android",
        osVersion: "13.0",
        deviceName: "Samsung Galaxy S23",
      },
      "bstack:w3c": true,
      "device:type": "mobile",
    },
  ],
  ...BSTACK_PROTOCOL,
  services: [
    [
      "browserstack",
      {
        setSessionStatus: true,
        setSessionName: true,
      },
    ],
  ],
  before: async function () {
    global.expect = chai.expect;
    await customCommands(browser);
  },
};

exports.config = Object.assign({}, mainConfig, configuration);
