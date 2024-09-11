// #! /usr/bin/env node

import { run } from "./run.js";
import config, { validateAndSaveConfig } from "./config/config.js";
import { version } from "./utilities/logo.js";
import { log } from "./helpers.js";
import { createNeededFiles } from "./helpers.js";
import catchAsyncErrors from "./utilities/errorHandling/catchAsyncErrors.js";

const main = async () => {
  // Set Globals
  global.version = version;
  global.savedConfig = config.get("ebay-cli");
  global.tasks = [];
  global.logThis = log;
  global.runMain = run;
  global.sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Check if no saved config, then set up with defaults
  if (!global.savedConfig) {
    log(`🔵 No saved config found. Setting up defaults...`, "info");

    try {
      const defaultConfig = validateAndSaveConfig();
      global.savedConfig = defaultConfig;
    } catch (error) {
      log(`❌ Error setting up default config: ${error.message}`, "error");
      process.exit(1); // Exit the process after handling the error
    }
  }

  // Create necessary files for the first run
  await catchAsyncErrors(createNeededFiles)();

  // Log to user
  log(`🔵 Verifying system...`, "info");
  await sleep(1000);
  log("🟢 System verified, welcome back!", "success");

  // Start the main run function
  run();
};

main();
