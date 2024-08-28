import inquirer from "inquirer";
import { handleEditSettings } from "./settings.js";
import config from "../../config/config.js";

export const handleSettingsManager = async () => {
  let response = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "[1] Edit Settings",
        "[2] Force Refresh Configuration",
        "[3] Go Back",
      ],
    },
  ]);

  if (response.action === "[1] Edit Settings") {
    await handleEditSettings();
  } else if (response.action === "[2] Force Refresh Configuration") {
    global.logThis("🕒 Refreshing Configuration...", "info");
    global.savedConfig = config.get("ebay-cli");
    global.logThis("🟢 Configuration refreshed!", "success");
    await sleep(1500);
    global.runMain();
  } else if (response.action === "[3] Go Back") {
    global.runMain();
  }
};
