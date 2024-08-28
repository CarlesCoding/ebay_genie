import { logger } from "../../../helpers.js";
import { locators } from "../../../utilities/locators.js";
import { fillAddressForm, fillPhoneForm } from "./forms.js";

const urlHandlers = {
  "https://www.ebay.com/": async (page, task, index) => {
    await handelEbayHomePage(page, task, index);
  },
  "https://signup.ebay.com/pa/crte": async (page, phoneData, task, index) => {
    await handelPhonePage(page, phoneData, task, index);
  },
  "https://reg.ebay.com/reg/Upgrade": async (page, task, index) => {
    await handelAddressPage(page, task, index);
  },
  "https://signin.ebay.com/logout/confirm": async (page, user, task, index) => {
    await handelLogoutPage(page, user, task, index);
  },
};

export const handleURL = (currentURL, page) => {
  const matchedHandler = Object.keys(urlHandlers).find((url) =>
    currentURL.startsWith(url)
  );
  return matchedHandler ? urlHandlers[matchedHandler] : null;
};

/**
 * Usage Example:
 * const handler = handleURL(currentURL, page);
 *
 * if (handler) {
 *   await handler(page);
 * } else {
 *   console.log("No match found for the current URL.");
 * }
 *
 */

// -------------------------- Url option handlers --------------------------
const handelLogoutPage = async (page, user, task, index) => {
  logger(
    task.module,
    `[Task #${index + 1}] Handling eBay logout page.`,
    "info"
  );

  // Find sign in link
  const signInBtn = await page.locator(locators.urlHandler.signInLink);
  await signInBtn.waitFor();

  // Saves email, just need to re-enter password
  const passwordField = await page.locator(locators.urlHandler.password);
  const submitBtn = await page.locator(locators.urlHandler.submit);

  // Type password in
  await passwordField.pressSequentially(user.password);
  await page.waitForTimeout(1500);

  logger(task.module, `[Task #${index + 1}] Rel-logging in...`, "info");

  // Submit
  await submitBtn.click();

  logger(task.module, `[Task #${index + 1}] Filling in form...`, "info");

  // Get redirected to street address input
  const addressField = await page.locator(locators.urlHandler.upgradeForm);
  await addressField.waitFor();

  // Get redirected to street address page and finish sign up process
  await fillAddressForm(page);
};

const handelAddressPage = async (page, task) => {
  logger(
    task.module,
    `[Task #${index + 1}] Handling eBay upgrade (Address) form.`,
    "info"
  );
  await fillAddressForm(page);
};

const handelPhonePage = async (page, phoneData, task, index) => {
  logger(
    task.module,
    `[Task #${index + 1}] Handling eBay signup page.`,
    "info"
  );

  // Check which form is present
  const element = await checkForElement(page);

  if (element === "input-phone") {
    logger(
      task.module,
      `[Task #${index + 1}] Handling phone verification form... (2/3)`,
      "info"
    );
    await fillPhoneForm(page, phoneData, task, index);
  } else if (element === "input-address") {
    logger(
      task.module,
      `[Task #${index + 1}] Handling address verification...`,
      "info"
    );
    await fillAddressForm(page);
  } else {
    throw new Error(`Unknown element: ${element}`);
  }
};

const handelEbayHomePage = async (page, task, index) => {
  logger(task.module, `[Task #${index + 1}] Handling eBay homepage.`, "info");
  let tries = 0;

  await clickMyEbay(page);

  do {
    tries++;
    try {
      await handleURL(await page.url(), page);
      break;
    } catch (e) {
      if (tries > 5)
        throw new Error(`Handle URL failed after ${tries} tries.. ${e}`);
      logger(
        task.module,
        `[Task #${index + 1}] Handle URL failed. ${tries} tries. Retrying.`,
        "error"
      );
    }
  } while (true);
};

// ----------------------------------- Helpers -----------------------------------
// Check which form user is directed too
const checkForElement = async (page) => {
  const elementsToCheck = [
    {
      locator: page.locator('[data-page="input-phone"]'),
      message: "input-phone",
    },
    {
      locator: page.locator('[data-page="input-address"]'),
      message: "input-address",
    },
    { locator: page.locator('a[title="My eBay"]'), message: "myEbayLink" },
  ];

  for (const { locator, message } of elementsToCheck) {
    const count = await locator.count();
    if (count > 0) {
      console.log(
        `Element with data-page="${message}" found. Performing action.`
      );
      return message;
    }
  }

  await clickMyEbay(page);

  await checkForElement(page);

  return `${currentURL} not handled yet.`;
};

// Click "My Ebay" button
export const clickMyEbay = async (page) => {
  // I think this is like the "reset" link: https://www.ebay.com/mys/home?source=GBH
  // const myEbayLink = page.locator('a[title="My eBay"]');
  const myEbayLink = page.locator(locators.urlHandler.myEbayLink);

  if (!myEbayLink) return logger("Element myEbayLink not found.");

  console.log("Element myEbayLink found. Performing action.");

  await myEbayLink.click();

  await page.waitForNavigation();

  console.log("Element myEbayLink Clicked! Rechecking...");
};
