# WINONA-PRODUCT-TESTS: Dynamic Priority Queue Test Distribution

A WebdriverIO + BrowserStack integration that implements a **Device 1 Priority Overflow** architecture — tests are distributed across two mobile devices using a mathematical priority queue, with all sessions grouped under a single unified build on the BrowserStack Automate dashboard.

This project uses **CommonJS** (`require`/`module.exports`) throughout — no `"type": "module"` in `package.json`, so it works with plain `node`/`wdio` invocations without ESM-related warnings.

---

## Architecture Overview

The system is built around two new files that integrate cleanly into the customer's existing repository **without modifying their core `configs/wdio.conf.js`**:

```
configs/
├── run-tests.js                          ← Orchestrator (NEW)
├── wdio.conf.js                          ← Customer's config (UNCHANGED — single source of truth)
├── config.js                             ← Shared BrowserStack W3C protocol (NEW)
├── waitForSlot.js                        ← Slot-check passthrough (NEW)
└── browserstack/
    ├── config-bstack-priority.js         ← Dynamic receiver config (NEW)
    ├── config-bstack-mobile-android.js   ← Android device definition (NEW)
    └── config-bstack-mobile-latest.js    ← iOS device definition (UPDATED)
shared/
└── commands.js                           ← Custom WDIO commands (UPDATED)
test/
├── specs/                                ← Default suite (10 specs)
└── suites/
    ├── suite-a/                          ← Suite A (20 specs)
    ├── suite-b/                          ← Suite B (100 specs — stress test)
    ├── suite-c/                          ← Suite C (13 specs — D1 preference demo)
    └── suite-d/                          ← Suite D (23 specs — round logic demo)
```

---

## How It Works

### Step 1 — The Orchestrator (`configs/run-tests.js`)

This is the execution entry point. When you run `npm run bstack:priority`, this script:

1. **Reads suite definitions** from `configs/wdio.conf.js` via `require('./wdio.conf.js').mainConfig.suites` — the customer's file is the single source of truth for test paths. No duplication.
2. **Resolves file paths** using `glob`, normalising the `../../` prefix so patterns work from the project root.
3. **Shuffles** the resolved spec list using a Fisher-Yates algorithm — every run produces a different random order.
4. **Applies the priority queue** — specs are assigned in fixed rounds of `DEVICE1_LIMIT + DEVICE2_LIMIT` (default: 5 + 5 = 10):
   - The first 5 specs in each round → Device 1 (Android, priority)
   - The next 5 specs in each round → Device 2 (iOS, overflow)
   - Any remainder at the end of the last round → Device 1 (always preferred)
5. **Spawns a single `wdio` process** with both spec lists injected as `DEVICE1_SPECS` and `DEVICE2_SPECS` JSON environment variables, plus a shared `BROWSERSTACK_BUILD_NAME` timestamp — one process = one build on the BrowserStack dashboard, no race condition.

**Priority queue example with 23 specs (5+5 limit):**

```
Round 1 (specs 1–10):  D1 gets 1–5,   D2 gets 6–10
Round 2 (specs 11–20): D1 gets 11–15, D2 gets 16–20
Round 3 (specs 21–23): D1 gets 21–23, D2 gets nothing (remainder always goes to D1)
Result: D1 = 13 specs, D2 = 10 specs ✓
```

### Step 2 — The Dynamic Receiver (`configs/browserstack/config-bstack-priority.js`)

This is the WebdriverIO configuration file executed by the orchestrator. It:

1. **Parses** `DEVICE1_SPECS` and `DEVICE2_SPECS` from environment variables.
2. **Dynamically imports** the customer's existing device configurations:
   - `config-bstack-mobile-android.js` → Android capability (Device 1)
   - `config-bstack-mobile-latest.js` → iOS capability (Device 2)
3. **Clones** each capability object using `JSON.parse(JSON.stringify(...))` to avoid mutating the originals.
4. **Injects** the calculated spec list, `wdio:maxInstances: 5`, session name, and build name into each cloned capability.
5. **The Guardrail**: Uses `if (specs.length > 0)` conditions — if the orchestrator assigns zero tests to Device 2, the iOS capability is **never added** to the config. This completely eliminates the `TypeError: Cannot read properties of undefined (reading 'sessionId')` crash that occurs when WebdriverIO initialises a capability with an empty `specs: []` array.
6. **Exports** the merged config by spreading `iosConfig` (inheriting the customer's hooks and base settings) and overriding `specs` and `capabilities`.

### Why Dynamic Capability Import?

The original approach hardcoded device details (Appium version, Safari settings, OS version, etc.) directly in `config-bstack-priority.js`. This violated the customer's DRY architecture — any update to their device configs would require a duplicate update in the priority file.

The refactored approach `require()`s their existing files, extracts the pre-configured capability objects, and injects only what the priority queue needs (specs, session name, build name). The customer's device settings are inherited automatically.

---

## File-by-File Explanation

### `configs/run-tests.js` — Orchestrator

The execution entry point. Reads suites, shuffles specs, applies the priority queue math, and spawns a single WDIO process. **This is the only file that needs to change if you want to adjust device limits or add a third device.**

### `configs/browserstack/config-bstack-priority.js` — Dynamic Receiver

The WDIO config executed by the orchestrator. Dynamically imports customer capability files, clones them, injects spec lists, and exports the merged config. Contains the `sessionId` crash guardrail.

### `configs/browserstack/config-bstack-mobile-android.js` — Android Device Definition

Self-contained capability definition for Samsung Galaxy S23 (Android 13, Chrome). Imported by `config-bstack-priority.js` as Device 1. Can be updated independently without touching the priority config.

### `configs/browserstack/config-bstack-mobile-latest.js` — iOS Device Definition

Self-contained capability definition for iPhone 15 Pro Max (iOS 17, Safari). Imported by `config-bstack-priority.js` as Device 2. Includes Safari-specific settings (`allowAllCookies`, `enablePopups`).

### `configs/config.js` — Shared BrowserStack Protocol

Exports the `BSTACK_PROTOCOL` object (`hostname`, `port`, `protocol`, `path`) used by all BrowserStack config files. Centralises the hub connection settings.

### `configs/waitForSlot.js` — Slot Check

Checks for available BrowserStack parallel slots before launching a run. Currently a passthrough (`process.exit(0)`) — replace with real slot-checking logic if needed.

### `configs/wdio.conf.js` — Customer Config (Unchanged)

The customer's central configuration file. **Zero changes were made to this file.** It remains the single source of truth for suite definitions, framework settings, and reporter configuration. The orchestrator reads `mainConfig.suites` from it via `require()`.

### `shared/commands.js` — Custom WDIO Commands

Exports a function that registers custom browser commands (e.g., `maximizeDesktopWindow`). Wrapped as an exported function so it can be called safely inside the `before` hook — `browser` is only available at session time, not at module load time.

---

## Suite Definitions

All suites are defined in `configs/wdio.conf.js` under `mainConfig.suites`. To add a new suite, add one entry there — no other file needs changing:

```javascript
// configs/wdio.conf.js → mainConfig.suites
A:       ['test/suites/suite-a/**/*.js'],              // 20 specs
B:       ['test/suites/suite-b/suite-b-test*.js'],     // 100 specs — stress test
C:       ['test/suites/suite-c/**/*.js'],              // 13 specs — D1 preference demo (D1=8, D2=5)
D:       ['test/suites/suite-d/**/*.js'],              // 23 specs — round logic demo (D1=13, D2=10)
default: ['test/specs/**/*.js'],                       // 10 specs
```

---

## Run Commands

```bash
# Install dependencies
npm install

# Run the priority queue orchestrator with a specific suite
npm run bstack:priority -- --suite=A      # 20 specs → D1=10, D2=10
npm run bstack:priority -- --suite=B      # 100 specs → D1=50, D2=50 (stress test)
npm run bstack:priority -- --suite=C      # 13 specs → D1=8, D2=5 (D1 preference demo)
npm run bstack:priority -- --suite=D      # 23 specs → D1=13, D2=10 (round logic demo)
npm run bstack:priority                   # default suite (10 specs → D1=5, D2=5)
```

---

## BrowserStack Dashboard

All sessions from a single run appear under **one build** prefixed `WINONA-Priority-<timestamp>`. You can verify:

- Only the expected devices booted (if ≤5 specs, only Device 1 appears — no empty Device 2 session)
- Session status is correctly marked Passed/Failed (via `@wdio/browserstack-service` with `setSessionStatus: true`)
- Up to 5 parallel sessions per device run simultaneously

---

## Priority Skew Reference

| Total specs | Device 1 | Device 2 | Notes                         |
| ----------- | -------- | -------- | ----------------------------- |
| 1–5         | 1–5      | 0        | All fit in D1; D2 never boots |
| 6–10        | 5        | 1–5      | D1 full, overflow to D2       |
| 13          | 8        | 5        | Round 2 remainder → D1        |
| 20          | 10       | 10       | Even split (2 full rounds)    |
| 23          | 13       | 10       | Round 3 remainder → D1        |
| 100         | 50       | 50       | 10 full rounds, even split    |

---

## Integration Steps

Follow these steps to integrate the WINONA priority queue into an existing WebdriverIO + BrowserStack CommonJS repository.

### Prerequisites

- Node.js ≥ 16
- An existing WebdriverIO project using CommonJS (`require`/`module.exports`)
- BrowserStack account with `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY`

### Step 1 — Install Dependencies

```bash
npm install glob --save
npm install @wdio/browserstack-service --save-dev
```

### Step 2 — Add Environment Variables

Ensure your `.env` file contains:

```
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
ENVIRONMENT=staging   # or whichever environment your wdio.conf.js expects
```

### Step 3 — Create `configs/config.js`

```javascript
"use strict";

const BSTACK_PROTOCOL = {
  hostname: "hub.browserstack.com",
  port: 443,
  protocol: "https",
  path: "/wd/hub",
};

module.exports = { BSTACK_PROTOCOL };
```

### Step 4 — Create `configs/waitForSlot.js`

```javascript
#!/usr/bin/env node
// Replace with real slot-checking logic if needed
process.exit(0);
```

### Step 5 — Create Device Capability Files

Create `configs/browserstack/config-bstack-mobile-android.js` and `configs/browserstack/config-bstack-mobile-latest.js` (or reuse existing ones) following the pattern in this repo — each must export `exports.config` with a `capabilities` array containing at least one capability object with a `bstack:options` block.

### Step 6 — Create `configs/browserstack/config-bstack-priority.js`

Copy the file from this repo. It dynamically imports your device capability files, applies the priority queue spec injection, and exports the merged config. The `if (specs.length > 0)` guardrail prevents the `sessionId` crash.

Update the two `require()` paths at the top to point to your actual device config files:

```javascript
const androidConfig = require("./config-bstack-mobile-android.js").config;
const iosConfig = require("./config-bstack-mobile-latest.js").config;
```

### Step 7 — Overwrite `configs/run-tests.js`

Copy the orchestrator from this repo. Update:

- `WDIO_CONFIG` — path to your `config-bstack-priority.js`
- `DEVICE1_LIMIT` / `DEVICE2_LIMIT` — parallel slots per device (match your BrowserStack plan)
- The `require('./wdio.conf.js').mainConfig` import — adjust to match how your `wdio.conf.js` exports its config

### Step 8 — Wrap `shared/commands.js` as an Exported Function

If your `commands.js` calls `browser.addCommand()` at the top level, wrap it:

```javascript
// Before (breaks on require — browser not yet defined)
browser.addCommand('myCommand', async () => { ... });

// After (safe — called inside before hook when browser exists)
module.exports = async function customCommands(browser) {
  browser.addCommand('myCommand', async () => { ... });
};
```

### Step 9 — Add the Run Script to `package.json`

```json
"scripts": {
  "bstack:priority": "npm run waitForSlot && node ./configs/run-tests.js"
}
```

### Step 10 — Add Suite Definitions

In your `wdio.conf.js`, add suite entries under `mainConfig.suites` (or `exports.config.suites`):

```javascript
suites: {
  myNewSuite: ['tests/ui/e2e/my-feature/**/*.js'],
  // ... existing suites unchanged
}
```

### Step 11 — Run and Verify

```bash
npm run bstack:priority -- --suite=myNewSuite
```

Check the terminal output for:

```
Found N spec(s) for suite 'myNewSuite'.
Build: WINONA-Priority-<timestamp>
-> Device 1 (Priority) assigned X spec(s).
-> Device 2 (Overflow) assigned Y spec(s).
```

Then verify on the BrowserStack Automate dashboard that a single `WINONA-Priority-*` build appears with the correct device sessions and Passed/Failed status.

---

## Scaling

| Goal                                        | Change                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| More parallel sessions per device           | Increase `wdio:maxInstances` in capability files + `DEVICE1_LIMIT`/`DEVICE2_LIMIT` in `run-tests.js`                     |
| Add a third device                          | Add a third capability file, import it in `config-bstack-priority.js`, add a `device3Specs` assignment in `run-tests.js` |
| Change device (e.g. Pixel 7 instead of S23) | Update `config-bstack-mobile-android.js` only — no changes to the priority config                                        |
| Change iOS version                          | Update `config-bstack-mobile-latest.js` only                                                                             |
| Add a new test suite                        | Add one entry to `mainConfig.suites` in `wdio.conf.js`                                                                   |
