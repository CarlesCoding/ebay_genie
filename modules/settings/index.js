import inquirer from "inquirer";
import { handleEditSettings } from "./settings.js";
import config from "../../config/config.js";
import { handleImportExport } from "./handleImportExport.js";
import { log, restartApp } from "../../helpers.js";

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
    try {
      await handleEditSettings();
    } catch (error) {
      throw error;
    }
  } else if (response.action === "[2] Import/Export Settings") {
    await handleImportExport();
  } else if (response.action === "[3] Force Refresh Configuration") {
    log("🕒 Refreshing Configuration...", "info");
    global.savedConfig = config.get("ebay-cli");
    log("🟢 Configuration refreshed!", "success");
    await restartApp(1500);
    return;
  } else if (response.action === "[4] Delete All Saved Settings") {
    log("🕒 Deleting all saved settings...", "info");
    config.clear();
    log("🟢 All saved settings deleted!", "success");
    await restartApp(1500);
    return;
  } else if (response.action === "[5] Go Back") {
    await restartApp();
    return;
  }
};
