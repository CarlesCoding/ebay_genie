import {
  humanTypeAdvanced,
  simulateHumanClick,
} from "../../../utilities/botProtectionHelpers.js";
import { pollForCode } from "./pollCode.js";
import { isElementPresent, logger } from "../../../helpers.js";
import { faker } from "@faker-js/faker";
import { locators } from "../../../utilities/locators.js";

// Signup form
export const fillPersonalInfoForm = async (page, user, task, index) => {
  try {
    // IF captcha, stop and solve, then resume
    await page.solveRecaptchas();

    // Check user object is not empty
    if (user.length === 0) {
      throw new Error("User object is empty");
    }

    // Fill in form
    try {
      await humanTypeAdvanced(page, [
        { selector: locators.signUpForm.firstname, text: user.firstName },
        { selector: locators.signUpForm.lastname, text: user.lastName },
        { selector: locators.signUpForm.Email, text: user.email },
        { selector: locators.signUpForm.password, text: user.password },
      ]);
    } catch (error) {
      throw new Error(`Failed to fill Personal Info Form: ${error.message}`);
    }

    // wait a few seconds before clicking submit
    await page.waitForTimeout(3000);

    logger(task.module, `[Task #${index + 1}] Submitting form 1/3...`, "info");

    // check for btn and make sure its not disabled (if info is inputted wrong it will be disabled). This should stop it from "submitting successfully" even though it is not.
    const buttonSelector = await page.locator(locators.signUpForm.submitBtn);

    try {
      await checkAndClickButton(buttonSelector, task, index);
    } catch (error) {
      console.error(`Error occurred trying to submit form: ${error.message}`);
      throw new Error("");
    }
  } catch (error) {
    throw new Error(`Failed to fill Personal Info Form: ${error.message}`);
  }
};

// Phone verification form
export const fillPhoneForm = async (page, phoneData, task, index) => {
  try {
    // Add Phone Number - id = phoneCountry
    const phoneLocator = page.locator(locators.phoneForm.phoneCountry);
    phoneLocator.waitFor();
    // await page.waitForSelector("#phoneCountry");
    const phoneNumber = phoneData.phone;

    logger(
      task.module,
      `[Task #${index + 1}] Filling in phone number form... (2/3)`,
      "info"
    );

    await phoneLocator.pressSequentially(phoneNumber, { delay: 150 });
    await page.waitForTimeout(1000);

    logger(
      task.module,
      `[Task #${index + 1}] Submitting phone number...`,
      "info"
    );

    await phoneLocator.press("Enter");

    // Check if code needed (Sometimes it will just accept the number, no verification needed)
    // const isCodeNeeded = await page.waitForSelector(".phoneVerifyDiv");

    // Check if code is needed (Sometimes it will just accept the number, no verification needed)
    const phoneVerifyLocator = page.locator(locators.phoneForm.phoneVerifyPage);
    await phoneVerifyLocator.waitFor({ state: "attached" });

    if (await phoneVerifyLocator.isVisible()) {
      logger(task.module, `[Task #${index + 1}] Waiting for code...`, "info");

      // Poll for code
      let code = await pollForCode(phoneData, task, index);

      // Check if code received
      if (!code) {
        throw new Error("No Code received. Try again.");
      }

      logger(task.module, `[Task #${index + 1}] Code: ${code}`, "success");

      // Wait for code input fields (assuming input fields are dynamically added or visible later)
      await phoneVerifyLocator.waitFor({ state: "visible" });

      logger(task.module, `[Task #${index + 1}] Inputting code...`, "info");

      // Input code
      for (let i = 0; i < code.length; i++) {
        await page.type(`#pinbox-${i}`, code[i]);
      }
    }

    // if (isCodeNeeded !== null) {
    //   await page.waitForSelector(".phoneVerifyDiv");

    //   logger(task.module, `[Task #${index + 1}] Waiting for code...`, "info");

    //   // Poll for code
    //   let code = await pollForCode(phoneData, log, task, index);

    //   // Check if code received
    //   if (!code || code === null) {
    //     throw new Error("No Code received. Try agin.");
    //   }

    //   logger(task.module, `[Task #${index + 1}] Code: ${code}`, "success");

    //   // wait for code input fields
    //   await page.waitForSelector(".phoneVerifyDiv");

    //   logger(task.module, `[Task #${index + 1}] Inputting code...`, "info");

    //   // Input code
    //   for (let i = 0; i < code.length; i++) {
    //     await page.type(`#pinbox-${i}`, code[i]);
    //   }
    // }

    logger(
      task.module,
      `[Task #${index + 1}] Phone Verification Form submitted! (2/3)`,
      "info"
    );

    // Auto redirects on enter (either to address input page.. or logout page https://signin.ebay.com/logout/confirm)
    await page.waitForTimeout(2000);
  } catch (error) {
    throw new Error(`Error in fillPhoneForm: ${error.message}`);
  }
};

// Address Form
export const fillAddressForm = async (page, task, index, user) => {
  // 2 possible form selectors
  const possibleFormSelectors = locators.addressForm.possibleFormSelectors;

  let formExists = false;
  for (const selector of possibleFormSelectors) {
    try {
      const element = await page.locator(selector).first();
      if ((await element.isVisible()) && !(await element.isDisabled())) {
        formExists = true;
        break;
      }
    } catch (error) {
      // Handle error if needed
      logger(
        task.module,
        `[Task #${index + 1}] There was an error checking for forms.. ${error}`,
        "error"
      );
    }
  }

  if (!formExists) throw new Error("Upgrade form not found.");

  // Wait so page is visible
  await page.waitForTimeout(2000);

  // ----- Fill out form -----
  // 1.A) Country - Locate the select element
  const selectCountry = await page.locator(
    locators.addressForm.countrySelector
  );

  // 1.B) Choose an option
  await selectCountry.selectOption(locators.addressForm.country);

  // 2.) Street Address - locate the input field
  const streetAddressInput = await page.locator(
    locators.addressForm.addressInputField
  );

  // Make the "Enter address manually" button visible, Focus and type into the input box to trigger the suggestions
  await streetAddressInput.fill("1");

  const manualBtn = await page.locator(locators.addressForm.manualBtn);

  await manualBtn.waitFor({ state: "visible" });

  // Click the "Enter address manually" button
  await manualBtn.click();

  const { street, city, state, zipCode } = user.address;

  // Get State 2
  const selectState = await page.locator(locators.addressForm.state);

  try {
    await humanTypeAdvanced(page, [
      { selector: locators.addressForm.address, text: street },
      { selector: locators.addressForm.city, text: city },
    ]);
  } catch (error) {
    throw new Error(`Failed to fill Personal Info Form: ${error.message}`);
  }

  // Fill in address
  await selectState.selectOption(state); // id="state" (Select) value is two letter. Example: 'US' click
  try {
    await humanTypeAdvanced(page, [
      { selector: locators.addressForm.zipCode, text: zipCode },
    ]);
  } catch (error) {
    throw new Error(`Failed to fill Personal Info Form: ${error.message}`);
  }

  await page.waitForTimeout(1500);

  logger(
    task.module,
    `[Task #${index + 1}] Checking for phone verification...`,
    "info"
  );

  // 3.) Check for phone field - Fill in phone if needed
  const isPhoneNumber = await isElementPresent(
    page,
    locators.phoneForm.phoneVerifyPage
  );

  if (isPhoneNumber) {
    // DID NOT ASK TO VERIFY NUMBER (using fake one here.. if gets blocked, will get a real one)
    const fakeNumber = faker.phone.number();
    await isPhoneNumber.pressSequentially(fakeNumber, { delay: 150 });
  }

  logger(
    task.module,
    `[Task #${index + 1}] Submitting address form... (3/3)`,
    "info"
  );

  // Submit form
  const submitBtn = await page.locator(locators.addressForm.submit);
  await submitBtn.click();

  logger(
    task.module,
    `[Task #${index + 1}] Address form  submitted! (3/3)`,
    "info"
  );
};

/* -------------------- Helper Functions -------------------- */
const checkAndClickButton = async (locator, task, index) => {
  try {
    // Check if the button is visible
    const isVisible = await locator.isVisible();
    if (!isVisible) {
      throw new Error(`Button not visible: ${locator}`);
    }

    // Check if the button is enabled
    const isEnabled = await locator.isEnabled();
    if (!isEnabled) {
      logger(
        task.module,
        `[Task #${
          index + 1
        }] Failed to submit. Button is visible but not enabled.`,
        "error"
      );
      throw new Error("Failed to submit. Button is visible but not enabled.");
    }

    console.log("Button is visible and enabled");

    // Click the button with a human-like delay
    await locator.click({ delay: 100 });
    console.log("Button clicked");
  } catch (error) {
    logger(
      task.module,
      `[Task #${index + 1}] Error: ${error.message}`,
      "error"
    );
    throw new Error(`Failed to fill Personal Info Form: ${error.message}`);
  }
};
