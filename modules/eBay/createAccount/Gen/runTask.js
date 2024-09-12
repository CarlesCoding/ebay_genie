import { cancelPhoneNumber } from "../../../../services/SMS/providers/sms-activate.js";
import { cancelFiveSimPhoneNumber } from "../../../../services/SMS/providers/fiveSim.js";
import { handleURL } from "../pageUrlHandler.js";
import { fillPersonalInfoForm } from "../forms.js";
import { generateDummyUser } from "../../../../utilities/botProtectionHelpers.js";
import { getPhone } from "../../../../services/SMS/handleGetNumber.js";
import { cancelTextVerifiedPhoneNumber } from "../../../../services/SMS/providers/textVerified.js";
import { fillAddressForm } from "../forms.js";
import { createBrowser } from "../../../../utilities/createBrowser.js";
import { monitorAndSolveCaptcha } from "../../../../utilities/captchaHandler.js";
import { logger, saveData } from "../../../../helpers.js";
import { urls } from "../../../../utilities/urls.js";
import { locators } from "../../../../utilities/locators.js";
import { nanoid } from "nanoid";

export const handelRunAcctGenTask = async (task, index) => {
  let browser = null;
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds delay between retries;
  let phoneData = null; // { provider, id, phone }
  let retryCount = 0;
  let user = {};

  while (retryCount < maxRetries) {
    try {
      // Get phone number
      phoneData = await getPhone(task);

      // Create new account data
      user = await generateDummyUser(task);

      // Create Browser
      browser = await createBrowser(task.useProxies, user);

      // Create Account
      const account = await createAccount(
        task,
        index,
        browser,
        phoneData,
        user
      );

      // save on success
      if (account.success) {
        await saveData(account.user, "ebayAccts", "append");
        logger(task.module, `[Task #${index + 1}] Account Saved!`, "success");

        // Exit the loop on success
        break;
      }
    } catch (error) {
      logger(
        task.module,
        `[Task #${index + 1}] Error during account creation: ${error}`,
        "error"
      );

      if (phoneData) {
        logger(
          task.module,
          `[Task #${index + 1}] Cancelling phone number with ID: ${
            phoneData.id
          }`,
          "info"
        );

        try {
          if (phoneData.provider === "sms-activate") {
            // SMS-Activate requires 2min before it can be canceled
            await cancelPhoneNumber(phoneData.id);
          } else if (phoneData.provider === "fivesim") {
            await cancelFiveSimPhoneNumber(phoneData.id);
          } else if (phoneData.provider === "textverified") {
            await cancelTextVerifiedPhoneNumber(phoneData.id);
          }
        } catch (cancelError) {
          logger(
            task.module,
            `[Task #${index + 1}] Error canceling phone number: ${
              cancelError.message
            }`,
            "error"
          );
        }
      }

      // Reset phoneData
      phoneData = null;
      // Increment retry count
      retryCount++;

      if (retryCount < maxRetries) {
        logger(
          task.module,
          `[Task #${index + 1}] Retrying in ${retryDelay / 1000} seconds...`,
          "info"
        );

        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    } finally {
      if (browser) {
        logger(task.module, `[Task #${index + 1}] Closing browser...`, "info");
        // Close browser & reset
        await browser.close();
        browser = null;
      }
    }
  }
};

const createAccount = async (task, index, browser, phoneData, user) => {
  // Set vars
  let { module } = task;
  logger(module, `[Task #${index + 1}] Creating Session...`, "info");

  let page = await browser.newPage();

  // Monitor for captcha dynamically during navigation in the account creation process
  let note = "createAccount";
  monitorAndSolveCaptcha(page, index, module, note);

  try {
    await page.goto(urls.ebayUrls.ebay);

    // Simulate random human scrolls
    // await randomPageScroll(page);
    // await randomPageScroll(page, "medium"); // speed = slow, medium, fast

    logger(module, `[Task #${index + 1}] Going to login page`, "info");

    await page.goto(urls.ebayUrls.signupPage, {
      waitUntil: "domcontentloaded",
    });

    // Ensure the "Personal" account radio button is selected
    const personalRadio = await page.locator(locators.ebayGen.radioBtn);
    const isChecked = await personalRadio.isChecked();

    const personalBtn = page.locator(locators.ebayGen.personalAcctRadioBtn);

    if (!isChecked) {
      await personalBtn.click();
    }

    logger(module, `[Task #${index + 1}] Generating Account...`, "info");

    const fistNameSelector = await page.locator(locators.ebayGen.firstName);
    await fistNameSelector.waitFor();

    logger(module, `[Task #${index + 1}] Filling in sign up form`, "info");

    // Start filling form 1/3
    await fillPersonalInfoForm(page, user, task, index);

    logger(module, `[Task #${index + 1}] Sign up Form 1/3 submitted`, "info");

    // wait a few seconds (testing purpose, delete later)
    await page.waitForTimeout(3000);
    const currentURL = await page.url();
    await page.waitForTimeout(2000);

    // PAGE FORM HANDLER - Checks which form user is directed to (Phone, addy, upgrade, logout, home )
    const handler = handleURL(currentURL, page);

    if (handler) {
      await handler(page, phoneData, task, index, user);
    } else {
      throw new Error("No match found for the current URL.");
    }

    await page.waitForTimeout(5000);

    // --- Go's to my ebay page. Reset and finish account creation ---
    await page.goto(urls.ebayUrls.homePage);

    logger(
      module,
      `[Task #${index + 1}] Filling in Address Form (3/3)`,
      "info"
    );

    // Now, Enter Address form
    await fillAddressForm(page, task, index, user);

    // Wait for 2 seconds (Page is slow to change sometimes..)
    await page.waitForTimeout(2000);

    // const expectedURL = "https://www.ebay.com/mye/myebay/summary";
    const expectedURL = urls.ebayUrls.summaryPage;
    // Check page for success
    if (page.url() !== expectedURL) {
      const currentPage = await page.url();
      throw new Error(
        `Expected URL: ${expectedURL}, but current URL: ${currentPage}`
      );
    }

    logger(
      module,
      `[Task #${index + 1}] Successful Account Creation! 🎉`,
      "success"
    );

    // Add an id to the user object
    const id = nanoid(10);
    user.id = id;

    // Return the user object and success status
    return { success: true, user };
  } catch (error) {
    return "Failed";
    // throw new Error(`Error creating account: ${error.message}`);
  } finally {
    // Close the page
    await page.close();
  }
};
