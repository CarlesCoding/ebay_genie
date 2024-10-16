import fs from "fs/promises";
// import { promises as fs } from "fs";
import path from "path";
import chalk from "chalk";
import { version } from "./utilities/logo.js";
import { countryCodes } from "./utilities/statesAndCodes.js";
import UserAgent from "user-agents";
import lockfile from "proper-lockfile";
import AppError from "./utilities/errorHandling/appError.js";
import yoctoSpinner from "yocto-spinner";
import inquirer from "inquirer";

// -------------------- Update process title --------------------
export const updateProcessTitle = () => {
  let title = ``;
  if (process.platform === "win32") {
    process.title = `Ebay viewbot | Version: ${version}`;
    title = process.title;
  } else {
    process.stdout.write("\x1b]2;" + title + "\x1b\x5c"); // Other then Windows
  }
};

// --------------------------- Files -----------------------------
// Read from JSON file
export const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null; // file does not exist
    }
    console.error(error);
    throw error;
  }
};

export const writeJsonFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw error;
  }
};

// Check if file exists
export const checkFileExist = async (filePath) => {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    return false; // Return false if the file does not exist or cannot be accessed
  }
};

// Create a func that creates a proxy.txt file and an accounts.json file
export const createNeededFiles = async () => {
  // Files to create
  const filesToCreate = [
    {
      path: path.join(process.cwd(), "assets", "proxies.json"),
      content: { proxies: [] },
    },
    {
      path: path.join(process.cwd(), "assets", "ebayAccts.json"),
      content: { accounts: [] },
    },
  ];

  try {
    // Check for file existence & add only the missing files into the next step.
    // const filesNotExisting = await Promise.all(
    //   filesToCreate.map(async ({ path, content }) => {
    //     const fileExists = await checkFileExist(path);
    //     return !fileExists ? { path, content } : null;
    //   })
    // );
    const filesNotExisting = await Promise.all(
      filesToCreate.map(async ({ path, content }) => {
        try {
          const fileExists = await checkFileExist(path);
          return !fileExists ? { path, content } : null;
        } catch (error) {
          // Handle specific file check errors
          throw new CustomError(
            `Error checking file existence at ${path}: ${error.message}`,
            "E_FILE_CHECK"
          );
        }
      })
    );

    // Filter out any `null` results (files that already exist)
    const filesToWrite = filesNotExisting.filter((file) => file !== null);

    // Create missing files
    // await Promise.all(
    //   filesToWrite.map(({ path, content }) => writeJsonFile(path, content))
    // );
    await Promise.all(
      filesToWrite.map(async ({ path, content }) => {
        try {
          await writeJsonFile(path, content);
        } catch (error) {
          // Handle specific file write errors
          throw new CustomError(
            `Error writing file at ${path}: ${error.message}`,
            "E_FILE_WRITE"
          );
        }
      })
    );
  } catch (error) {
    // Handle any other errors from the main function
    throw new AppError(
      `Error creating needed files: ${error.message}`,
      "E_FILE_CREATION"
    );
  }
};

// ------------------------ Data Files (accounts & proxies) --------------------------
// Save accounts & proxies (default: append)
export const saveData = async (data, file, action = "append") => {
  const rootDirectory = process.cwd();
  const filePath = path.join(rootDirectory, "assets", `${file}.json`);
  let release;

  if (!data || typeof data !== "object") {
    throw new Error("Invalid data object");
  }

  try {
    // Acquire a lock on the file
    release = await lockfile.lock(filePath);

    let contents;

    if (action === "append") {
      const fileExists = await checkFileExist(filePath);

      if (fileExists) {
        contents = await readJsonFile(filePath);
      } else {
        contents = { [file]: [] }; // Initialize with an empty array
      }

      // Ensure `contents[file]` exists and is an array
      if (!Array.isArray(contents[file])) {
        throw new Error(`Invalid format in ${file}.json`);
      }

      // ----------------------------
      // Create a map to keep track of existing proxies or accounts
      // when you append data, you avoid duplicates and ensure all entries are up-to-date.
      const existingMap = new Map(
        contents[file].map((item) => [item.proxy || item.account, item])
      );

      // Update existing entries and add new entries
      for (const item of data) {
        if (existingMap.has(item.proxy || item.account)) {
          if (item.latency === 0) {
            console.log(
              `SKIPPING ITEM : ${item.proxy} with latency: ${item.latency}`
            );
            continue; // Skip adding the item if it already exists
          }
        }
        existingMap.set(item.proxy || item.account, item);
      }

      // Convert the map back to an array
      contents[file] = Array.from(existingMap.values());

      // ----------------------------
    } else if (action === "overwrite") {
      contents = {
        [file]: data,
      };
    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    await writeJsonFile(filePath, contents);
  } catch (error) {
    throw new Error(`Failed to save ${data} to ${filePath}: ${error.message}`);
  } finally {
    // Release the lock
    if (release) {
      await release();
    }
  }
};

// Delete all saved data from file (accounts & proxies)
export const deleteData = async (file) => {
  const rootDirectory = process.cwd();
  const filePath = path.join(rootDirectory, "assets", `${file}.json`);

  global.logThis("Deleting all saved proxies...", "info");

  let contents = { [file]: [] };

  await writeJsonFile(filePath, contents);

  global.logThis(`Successfully deleted all saved ${file}!`, "success");
};

// --------------------------- Accounts -----------------------------
// Get Array of accounts from eBayAccounts.json
export const getAllSavedAccounts = async () => {
  let contents;
  // Get file
  const filePath = path.join(process.cwd(), "assets", "ebayAccts.json");

  try {
    // Check if file exists
    let fileExist = await checkFileExist(filePath);

    if (!fileExist) {
      throw new Error("File does not exist or is empty.");
    } else {
      // Read file and get contents
      contents = await readJsonFile(filePath);
    }

    return contents.accounts;
  } catch (error) {
    throw new Error(`Failed to get accounts: ${error.message}`);
  }
};

// Get array of accounts by random based on amount specified
export const getArrayOfAccounts = async (qty) => {
  // Get file
  const filePath = path.join(process.cwd(), "assets", "ebayAccts.json");

  let contents;

  try {
    // Read file
    contents = await readJsonFile(filePath);
  } catch (error) {
    throw new Error(`Failed to get accounts: ${error.message}`);
  }

  // Function to shuffle the array using Fisher-Yates algorithm
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Original array of  accounts
  const originalArray = contents.accounts;

  // Shuffle the original array
  const shuffledArray = shuffleArray(originalArray);

  // Create a new array with the first watcherCount amount of accounts from the shuffled array
  const newArray = shuffledArray.slice(0, qty);

  return newArray;
};

// Update Account with file lock
export const updateAccount = async (account) => {
  const rootDirectory = process.cwd();
  const filePath = path.join(rootDirectory, "assets", "ebayAccts.json");

  let release;
  try {
    // Acquire a lock on the file
    release = await lockfile.lock(filePath);

    // Read the file content
    const contents = await readJsonFile(filePath);
    if (!contents) {
      throw new Error("Account file does not exist");
    }

    const index = contents.accounts.findIndex((a) => a.id === account.id);
    if (index === -1) {
      throw new Error("Account not found");
    }

    contents.accounts[index] = account;

    // Write the updated accounts back to the file
    await writeJsonFile(filePath, contents);
  } catch (error) {
    throw new Error(`Failed to update account: ${error.message}`);
  } finally {
    // Release the lock
    if (release) {
      await release();
    }
  }
};

export const processAccountUpdate = async (account) => {
  try {
    await updateAccount(account);
    logger(module, `[Task #${i}] Account updated successfully.`, "info");
  } catch (error) {
    throw new Error(`Failed to update account: ${error.message}`);
  }
};

// Generate random password (Numbers & Letters only)
export const generatePassword = (characterAmount) => {
  // Function to create an array with all numbers between two specified numbers
  const arrayFromLowToHigh = (low, high) => {
    const array = [];
    for (let i = low; i <= high; i++) {
      array.push(i);
    }

    return array;
  };

  // Options
  const UPPERCASE_CHAR_CODES = arrayFromLowToHigh(65, 90);
  const LOWERCASE_CHAR_CODES = arrayFromLowToHigh(97, 122);
  const NUMBER_CHAR_CODES = arrayFromLowToHigh(48, 57);
  // Symbols cause too many errors.. (Can add them later if need be)

  // Use all char codes options
  let charCodes = UPPERCASE_CHAR_CODES.concat(
    LOWERCASE_CHAR_CODES,
    NUMBER_CHAR_CODES
  );

  const passwordCharacters = [];
  let hasNumber = false;

  for (let i = 0; i < characterAmount; i++) {
    const characterCode =
      charCodes[Math.floor(Math.random() * charCodes.length)];

    // Make sure the password contains a number
    if (NUMBER_CHAR_CODES.includes(characterCode)) {
      hasNumber = true;
    }

    passwordCharacters.push(String.fromCharCode(characterCode));
  }

  if (!hasNumber) {
    passwordCharacters[Math.floor(Math.random() * characterAmount)] =
      String.fromCharCode(
        NUMBER_CHAR_CODES[Math.floor(Math.random() * NUMBER_CHAR_CODES.length)]
      );
  }

  return passwordCharacters.join("");
};

// ------------------- Helpers --------------------
// Custom sleep function
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Restart main function
export const restartApp = async (sleepTime = 0) => {
  try {
    log("\nRestarting app...", "info");
    await sleep(sleepTime);
    global.runMain();
    return;
  } catch (error) {
    throw new AppError(`Failed to restart app: ${error.message}`, "E_FATAL");
  }
};

// Custom loading spinner
export const createSpinner = (text) => {
  const spinner = yoctoSpinner({ text: `${text}` });
  return {
    start: () => spinner.start(), // Start the spinner
    success: (message) => spinner.success(message), // Mark spinner as success
    fail: (message) => spinner.fail(message), // Mark spinner as failure
    update: (newText) => spinner.update({ text: newText }), // Update spinner text
    stop: () => spinner.stop(), // Manually stop the spinner
  };
};

// Custom press button to continue prompt
export const promptPressToContinue = async (
  message = "Press any key to continue..."
) => {
  const { key } = await inquirer.prompt({
    name: "key",
    type: "press-to-continue",
    anyKey: true,
    pressToContinueMessage: message,
  });
  return key;
};

// Get random integer function
export const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Shorten API key
export const shortenApiKey = (apiKey, startLength = 6, endLength = 6) => {
  // No need to shorten if the key is already short
  if (apiKey.length <= startLength + endLength) {
    return apiKey;
  }

  return `${apiKey.substring(0, startLength)}...${apiKey.substring(
    apiKey.length - endLength
  )}`;
};

// Get random item from array
export const randomItemFromArray = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Check if element is present with given locator (Playwright)
export const isElementPresent = async (page, locator) => {
  return (await page.locator(locator).count()) > 0;
};

// Check if country code is valid. (For getting Free proxies)
export const isValidCountryCode = (countryCode) => {
  // Get rid of spaces
  let code = countryCode.replace(/\s/g, "").trim().toUpperCase();

  // Check if it has commas
  if (code.includes(",")) {
    const codes = code.split(",");

    // Check code is only 2 characters && is a valid country code
    if (
      codes.some((code) => code.length !== 2 || !countryCodes.includes(code))
    ) {
      return false;
    }

    // if no commas, check code is 2 characters
  } else if (code.length !== 2 || !countryCodes.includes(code)) {
    return false;
  }

  return true;
};

export const addUserAgent = async (browser) => {
  // Set User-Agent
  const UA = new UserAgent();
  const userAgent = UA.toString();

  // Set the user agent for the page
  const context = await browser.newContext({
    userAgent: userAgent,
  });

  return context;
};

// Get user Agent
export const getUserAgent = () => {
  // Set User-Agent
  const UA = new UserAgent();
  const userAgent = UA.toString();

  return userAgent;
};

// Method 1 Uses selectors and simulateHumanClick()
const checkAndClickBtn = async (page, selector) => {
  // Check if the button is enabled
  const isButtonEnabled = await page.evaluate((buttonSelector) => {
    const button = document.querySelector(buttonSelector);
    return !button.hasAttribute("disabled");
  }, selector);

  if (isButtonEnabled) {
    console.log("Button is enabled");
    // Click the button if it is enabled
    await simulateHumanClick(page, selector);
    console.log(`${selector}: Btn clicked`);
  } else {
    throw new Error("Failed to submit.");
  }
};

// ? Method 2 Uses locators: SimulateHumanClick() needs refactored to use locators to make this work... Function to check if the button is visible and enabled
// const checkAndClickBtn2 = async (page, locator) => {
//   // Check if the button is visible
//   const isVisible = await locator.isVisible();
//   if (!isVisible) {
//     throw new Error(`Button not visible: ${locator}`);
//   }

//   // Check if the button is enabled
//   const isEnabled = await locator.isEnabled();
//   if (!isEnabled) {
//     throw new Error("Button is visible but not enabled.");
//   }

//   console.log("Button is visible and enabled");
//   // Click the button if it is enabled
//   await locator.click({ delay: 100 }); // Simulate a human-like click
//   console.log("Button clicked");
// };

// --------------------- Logger ---------------------\
// MAIN: Custom logger based on module used

export const logger = (module, message, type, color) => {
  log(`[${module}] -- ${message}`, type, color);
};

// Create custom log function
export const log = (message, type, color = "white") => {
  // Check if color is valid in chalk
  const checkColor = (color) => {
    const validColors = [
      "black",
      "red",
      "green",
      "yellow",
      "blue",
      "magenta",
      "cyan",
      "white",
      "gray",
      "grey",
      "redBright",
      "greenBright",
      "yellowBright",
      "blueBright",
      "magentaBright",
      "cyanBright",
      "whiteBright",
    ];

    if (!validColors.includes(color)) {
      throw new Error(`Invalid color: ${color}`);
    }

    return color;
  };

  switch (type) {
    case "error":
      console.log(chalk.red(message));
      break;
    case "success":
      console.log(chalk.green(message));
      break;
    case "warn":
      console.log(chalk.yellow(message));
      break;
    case "custom":
      console.log(chalk[checkColor(color)](message));
      break;
    case "info":
      console.log(chalk.blueBright(message));
      break;
  }
};
