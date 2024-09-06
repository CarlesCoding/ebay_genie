// #! /usr/bin/env node

import { run } from "./run.js";
import config from "./config/config.js";
import { defaultConfig } from "./config/config.js";
import { version } from "./utilities/logo.js";
import { log } from "./helpers.js";
import { createNeededFiles } from "./helpers.js";

const main = async () => {
  // Set Globals
  global.version = version;
  global.savedConfig = config.get("ebay-cli");
  global.tasks = [];
  global.logThis = log;
  global.runMain = run;
  global.sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Check for saved config, if none create it with defaults
  if (!global.savedConfig) {
    config.set("ebay-cli", defaultConfig);
    global.savedConfig = config.get("ebay-cli");

    /* if no config file, means its the first time running the app, Check and add necessary files */
    createNeededFiles();
  }

  // log to user
  log(`🔵 Verifying system...`, "info");
  await sleep(1000);
  log("🟢 System verified, welcome back!", "success");
  run();
};

main();
