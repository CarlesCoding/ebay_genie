import { log, restartApp, sleep } from "../../helpers.js";
import path from "path";
import fs from "fs";
import os from "os";
import inquirer from "inquirer";
import config, { validateAndSaveConfig } from "../../config/config.js";
import configSchema from "../../config/configSchema.js";

export const handleImportExport = async () => {
  let response = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "AIO Settings:",
      choices: [
        "[1] Import",
        "[2] Export",
        new inquirer.Separator(),
        "[3] Go Back",
      ],
    },
    {
      type: "input",
      name: "filePath",
      message:
        "Enter the path of the config file to import (drag and drop file into the terminal):",
      when: (answers) => answers.action === "[1] Import",
      validate: (input) => {
        const validationResult = validateFilePath(input);
        return validationResult === true ? true : validationResult;
      },
    },
  ]);

  if (response.action === "[1] Import") {
    importConfFile(response.filePath);
  } else if (response.action === "[2] Export") {
    exportConfFile();
  } else if (response.action === "[3] Go Back") {
    await restartApp();
    return;
  }

  await restartApp(1500);
  return;
};

const importConfFile = (filePath) => {
  try {
    const absolutePath = path.resolve(filePath);
    const configFile = JSON.parse(fs.readFileSync(absolutePath, "utf8"));

    // Validate the configuration using the function
    const validatedConfig = validateAndSaveConfig(configFile);

    // If validation is successful, set the config
    config.set("ebay-cli", validatedConfig);
    global.savedConfig = config.get("ebay-cli"); // Update global config
    log("🟢 Config imported successfully!", "success");
    return;
  } catch (error) {
    log(`❌ Invalid configuration format: ${error.message}`, "error");
    return;
  }
};

const exportConfFile = () => {
  const downloadsFolder = getDownloadsFolder();
  const now = new Date();
  const month = now.getMonth() + 1; // Months are zero-based, so +1
  const day = now.getDate();
  const year = now.getFullYear();

  const fileName = `ebay-cli-config-${month}-${day}-${year}.json`;
  const filePath = path.join(downloadsFolder, fileName);
  try {
    const currentConfig = config.get("ebay-cli");
    if (!currentConfig) {
      log(`❌ No config found to export.`, "error");
      return;
    }

    // Validate the configuration
    const { error } = configSchema.validate(currentConfig, {
      abortEarly: false,
    });
    if (error) {
      log(
        `❌ Invalid configuration: ${error.details
          .map((detail) => detail.message)
          .join(", ")}`,
        "error"
      );
      return;
    }

    // Write the config to the downloads folder
    fs.writeFileSync(filePath, JSON.stringify(currentConfig, null, 2));
    log(`🟢 Config exported to users downloads folder!`, "success");
  } catch (error) {
    log(`❌ Error exporting config: ${error.message}`, "error");
    return;
  }
};

// Save the export to the users downloads folder
const getDownloadsFolder = () => {
  const homeDir = os.homedir();
  return path.join(homeDir, "Downloads");
};

// Validate if the file exists and is a JSON file
const validateFilePath = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return "File does not exist. Please provide a valid file path.";
  }
  if (path.extname(filePath).toLowerCase() !== ".json") {
    return "File must be a JSON file.";
  }
  return true;
};
