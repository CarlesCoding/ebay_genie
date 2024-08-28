import fs from "fs/promises";
// import { promises as fs } from "fs";
import path from "path";
import chalk from "chalk";
import { version } from "./utilities/logo.js";
import { countryCodes } from "./utilities/statesAndCodes.js";
import UserAgent from "user-agents";
import lockfile from "proper-lockfile";

// Update process title
// export const updateProcessTitle = (views = 0, watchers = 0, fails = 0) => {
//   let title = "";
//   if (process.platform === "win32") {
//     title = `Ebay viewbot | Views: ${views} | Watchers: ${watchers} | Fails: ${fails}`;
//     process.title = title;
//   } else {
//     process.stdout.write("\x1b]2;" + title + "\x1b\x5c"); // Other then Windows
//   }
// };

// TODO: TEST THIS
// New Process Title (using globals)
export const updateProcessTitle = () => {
  let title = ``;
  if (process.platform === "win32") {
    process.title = `Ebay viewbot | Version: ${version} | Total Task: ${
      global.savedConfig.task?.length || 0
    } | Success: ${global.savedConfig.task?.success || 0} | Failed: ${
      global.savedConfig.task?.failed || 0
    }`;
    title = process.title;
  } else {
    process.stdout.write("\x1b]2;" + title + "\x1b\x5c"); // Other then Windows
  }
};

// Update the process title
// function updateProcessTitle(newTitle) {
//   process.title = newTitle;
// }

// Usage example
// updateProcessTitle("My CLI App - Task 1");
// The process title will now be 'My CLI App - Task 1'

// Success & Failed update
const updateSuccessFailed = () => {};

// --------------------------- Files -----------------------------
// Read from JSON file
export const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const readFile = async (filePath) => {
  try {
    const contents = await readJsonFile(filePath);
    return contents;
  } catch (error) {
    if (error.code === "ENOENT") {
      return null; // file does not exist
    } else {
      throw error;
    }
  }
};

export const writeFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw error;
  }
};

// Get file path based on environment
// TODO: Changed so its only .txt
export const getFilePath = (name) => {
  let filePath;

  // Check if in development environment
  if (process.env.NODE_ENV !== "development") {
    filePath = `${name}.txt.dev`;
  } else {
    filePath = `${name}.txt`;
  }

  return filePath;
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

// --------------------------- Accounts -----------------------------
// Get Array of accounts from eBayAccounts.json
export const getAccounts = async () => {
  let contents;
  // Get file
  const filePath = path.join(process.cwd(), "accounts", "ebayAccts.json");

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
  const filePath = path.join(process.cwd(), "accounts", "ebayAccts.json");

  // Read file
  const contents = await readJsonFile(filePath);

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

// Save account
// export const saveAccount = async (account) => {
//   // TESTING PATH ---
//   // import { fileURLToPath } from "url";
//   // import { dirname } from "path";
//   // const __dirname = dirname(fileURLToPath(import.meta.url));
//   // const fp = path.resolve(__dirname, "../../../..");
//   // const filePath = path.join(fp, "accounts", "ebayAccts.json");
//   // ---------

//   // Production path
//   const rootDirectory = process.cwd();
//   const filePath = path.join(rootDirectory, "accounts", "ebayAccts.json");
//   let contents;

//   try {
//     // Check if file exists
//     let fileExist = await checkFileExist(filePath);

//     if (!fileExist) {
//       contents = fs.writeFile(
//         filePath,
//         JSON.stringify({ accounts: [] }, null, 2)
//       );
//     } else {
//       // Read file and get contents
//       contents = await readJsonFile(filePath);
//     }

//     // Add new account
//     contents.accounts.push(account);

//     // Write file
//     // fs.writeFile(filePath, JSON.stringify(contents, null, 2));
//     await writeFile(filePath, contents);

//     return;
//   } catch (error) {
//     throw new Error(`Failed to save account: ${error.message}`);
//   }
// };

// export const saveAccount = async (account) => {
//   const rootDirectory = process.cwd();
//   const filePath = path.join(rootDirectory, "accounts", "ebayAccts.json");

//   if (!account || typeof account !== "object") {
//     throw new Error("Invalid account object");
//   }

//   try {
//     let contents = await readFile(filePath);
//     if (!contents) {
//       contents = { accounts: [] };
//     }

//     contents.accounts.push(account);
//     await writeFile(filePath, contents);
//   } catch (error) {
//     throw new Error(`Failed to save account: ${error.message}`);
//   }
// };

export const saveAccount = async (account) => {
  const rootDirectory = process.cwd();
  const filePath = path.join(rootDirectory, "accounts", "ebayAccts.json");
  let release;

  if (!account || typeof account !== "object") {
    throw new Error("Invalid account object");
  }

  try {
    // Acquire a lock on the file
    release = await lockfile.lock(filePath);

    const fileExists = await checkFileExist(filePath);

    let contents;

    if (fileExists) {
      contents = await readFile(filePath);
      contents = JSON.parse(contents);
    } else {
      contents = { accounts: [] };
    }

    contents.accounts.push(account);
    await writeFile(filePath, contents);
  } catch (error) {
    throw new Error(`Failed to save account to ${filePath}: ${error.message}`);
  } finally {
    // Release the lock
    if (release) {
      await release();
    }
  }
};

// export const updateAccount = async (account) => {
//   const rootDirectory = process.cwd();
//   const filePath = path.join(rootDirectory, "accounts", "ebayAccts.json");

//   try {
//     const contents = await readFile(filePath);
//     if (!contents) {
//       throw new Error("Account file does not exist");
//     }

//     const index = contents.accounts.findIndex((a) => a.id === account.id);
//     if (index === -1) {
//       throw new Error("Account not found");
//     }

//     contents.accounts[index] = account;
//     await writeFile(filePath, contents);
//   } catch (error) {
//     throw new Error(`Failed to update account: ${error.message}`);
//   }
// };

// Update Account with file lock
export const updateAccount = async (account) => {
  const rootDirectory = process.cwd();
  const filePath = path.join(rootDirectory, "accounts", "ebayAccts.json");

  let release;
  try {
    // Acquire a lock on the file
    release = await lockfile.lock(filePath);

    // Read the file content
    const contents = await readFile(filePath);
    if (!contents) {
      throw new Error("Account file does not exist");
    }

    const index = contents.accounts.findIndex((a) => a.id === account.id);
    if (index === -1) {
      throw new Error("Account not found");
    }

    contents.accounts[index] = account;

    // Write the updated accounts back to the file
    await writeFile(filePath, contents);
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
