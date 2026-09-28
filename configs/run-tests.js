#!/usr/bin/env node
const { spawn } = require("child_process");
const path = require("path");
const glob = require("glob");

// 1. Read suites from the adjacent wdio.conf.js file (since this script is in configs/)
const mainConfig = require("./wdio.conf.js").mainConfig;

// 2. The path to pass to the WDIO CLI (which executes from the project root)
const WDIO_CONFIG = "./configs/browserstack/config-bstack-priority.js";

const DEVICE1_LIMIT = 5;
const DEVICE2_LIMIT = 5;

// Shared build name so all sessions group together
const SHARED_BUILD_NAME = `WINONA-Priority-${new Date().toISOString().slice(0, 16).replace(":", "-")}`;

// CLI argument parsing for --suite
let targetSuite = process.env.SUITE || "default";
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--suite=")) {
    targetSuite = args[i].split("=")[1];
  } else if (args[i] === "--suite" && args[i + 1]) {
    targetSuite = args[i + 1];
  }
}

// Resolve the glob patterns from their config
function findSpecs(suiteName) {
  const suites = mainConfig.suites;
  const key = suiteName && suites[suiteName] ? suiteName : "allSt";
  const patterns = suites[key];

  if (!patterns) return [];

  let results = [];
  // WDIO globs are relative to root, but glob.sync here needs absolute or root-relative.
  // We resolve relative to the project root (one level up from configs)
  const rootDir = path.resolve(__dirname, "..");
  patterns.forEach((pattern) => {
    // The suite patterns use ../../ because in the customer repo configs/ sits two
    // levels above tests/. In this integration the two dirs are siblings, so we
    // normalise the pattern against the project root before globbing.
    const normPattern = pattern.replace(/^(\.\.\/)+/, "");
    results = results.concat(
      glob.sync(normPattern, { cwd: rootDir, absolute: true }),
    );
  });
  return [...new Set(results)];
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const allSpecs = shuffle(findSpecs(targetSuite));

if (allSpecs.length === 0) {
  console.log(`\nNo spec files found for suite: ${targetSuite}`);
  process.exit(0);
}

console.log(`\nFound ${allSpecs.length} spec(s) for suite '${targetSuite}'.`);
console.log(`Build: ${SHARED_BUILD_NAME}`);

// Device 1 Priority Queue Math
const device1Specs = [];
const device2Specs = [];

for (let i = 0; i < allSpecs.length; i++) {
  const posInRound = i % (DEVICE1_LIMIT + DEVICE2_LIMIT);
  if (posInRound < DEVICE1_LIMIT) {
    device1Specs.push(allSpecs[i]);
  } else {
    device2Specs.push(allSpecs[i]);
  }
}

console.log(`-> Device 1 (Priority) assigned ${device1Specs.length} spec(s).`);
console.log(
  `-> Device 2 (Overflow) assigned ${device2Specs.length} spec(s).\n`,
);

// Spawn the single WDIO process using their target directory structure
const child = spawn("npx", ["wdio", "run", WDIO_CONFIG], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    BROWSERSTACK_BUILD_NAME: SHARED_BUILD_NAME,
    DEVICE1_SPECS: JSON.stringify(device1Specs),
    DEVICE2_SPECS: JSON.stringify(device2Specs),
  },
});

child.on("exit", (code) => process.exit(code || 0));
