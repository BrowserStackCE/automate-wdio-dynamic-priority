"use strict";

/**
 * Shared BrowserStack W3C protocol configuration.
 * Imported by all configs/browserstack/config-bstack-*.js files.
 */
const BSTACK_PROTOCOL = {
  hostname: "hub.browserstack.com",
  port: 443,
  protocol: "https",
  path: "/wd/hub",
};

module.exports = { BSTACK_PROTOCOL };
