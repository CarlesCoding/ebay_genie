import inquirer from "inquirer";
import { logLogo } from "./utilities/logo.js";
import { sleep, updateProcessTitle } from "./helpers.js";
import { handleSettingsManager } from "./modules/settings/index.js";
import { handleProxyManager } from "./modules/proxyManager/index.js";
import { handleEbayManager } from "./modules/eBay/index.js";

export const run = async () => {
  try {
    // Clear console
    console.clear();

    // Set title
    updateProcessTitle();

    // Display logo
    logLogo();

    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "[1] eBay",
          "[2] Proxy Manager",
          "[3] Settings",
          "[4] Exit CLI",
        ],
      },
    ]);

    if (answer.action === "[1] eBay") {
      await handleEbayManager();
    } else if (answer.action === "[2] Proxy Manager") {
      await handleProxyManager();
    } else if (answer.action === "[3] Settings") {
      await handleSettingsManager();
    } else if (answer.action === "[4] Exit CLI") {
      console.log("👋 Exiting eBay genie...");
      await sleep(1500);
      console.clear();
      process.exit();
    }
  } catch (error) {
    throw new Error(`Error in run: ${error.message}`);
  }
};
