import { log, sleep } from "../../helpers.js";
import path from "path";
import fs from "fs";
import os from "os";
import inquirer from "inquirer";
import config from "../../config/config.js";
import { validateConfig } from "../../config/validateConfig.js";

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
    global.runMain();
    return;
  }

  await sleep(2000);
  global.runMain();
  return;
};

const importConfFile = (filePath) => {
  try {
    const absolutePath = path.resolve(filePath);
    const configFile = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
    const isValid = validateConfig(configFile);

    if (isValid.valid) {
      config.set("ebay-cli", configFile);
      global.savedConfig = config.get("ebay-cli"); // Update global config
      log("🟢 Config imported successfully!", "success");
      return;
    } else {
      log(`Invalid configuration format: ${isValid.errorMessage}`, "error");
    }
  } catch (error) {
    throw new Error(`Error importing config: ${error.message}`);
  }
};

const exportConfFile = () => {
  const downloadsFolder = getDownloadsFolder();
  const filePath = path.join(downloadsFolder, "ebay-cli-config.json");

  try {
    const currentConfig = config.get("ebay-cli");
    fs.writeFileSync(filePath, JSON.stringify(currentConfig, null, 2));
    log(`🟢 Config exported to users downloads folder!`, "success");
  } catch (error) {
    log(`Error exporting config: ${error.message}`, "error");
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
