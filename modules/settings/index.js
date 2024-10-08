import inquirer from "inquirer";
import { handleEditSettings } from "./settings.js";
import config from "../../config/config.js";
import { handleImportExport } from "./handleImportExport.js";
import { sleep } from "../../helpers.js";

export const handleSettingsManager = async () => {
  let response = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "[1] Edit Settings",
        "[2] Import/Export Settings",
        "[3] Force Refresh Configuration",
        "[4] Delete All Saved Settings",
        new inquirer.Separator(),
        "[5] Go Back",
      ],
    },
  ]);

  if (response.action === "[1] Edit Settings") {
    await handleEditSettings();
  } else if (response.action === "[2] Import/Export Settings") {
    await handleImportExport();
  } else if (response.action === "[3] Force Refresh Configuration") {
    global.logThis("🕒 Refreshing Configuration...", "info");
    global.savedConfig = config.get("ebay-cli");
    global.logThis("🟢 Configuration refreshed!", "success");
    await sleep(1500);
    global.runMain();
    return;
  } else if (response.action === "[4] Delete All Saved Settings") {
    global.logThis("🕒 Deleting all saved settings...", "info");
    config.clear();
    global.logThis("🟢 All saved settings deleted!", "success");
    await sleep(1500);
    global.runMain();
    return;
  } else if (response.action === "[5] Go Back") {
    global.runMain();
    return;
  }
};
