import { logger, processAccountUpdate } from "../../../helpers.js";
import { simulateHumanClick } from "../../../utilities/botProtectionHelpers.js";
import { handleCaptcha } from "../../../utilities/captchaHandler.js";
import { createBrowser } from "../../../utilities/createBrowser.js";
import { urls } from "../../../utilities/urls.js";
import { locators } from "../../../utilities/locators.js";

// -------------------------------- Sign in Flow ----------------------------------
// Sign in url --> https://www.ebay.com/signin OR https://signin.ebay.com/ws/eBayISAPI.dll?SignIn&ru=https%3A%2F%2Fwww.ebay.com%2Fmys%2Fhome%3Fsource%3DGBH&sgfl=sm&smuid=0ff99a5b406f44b895af91ec07217886
// Email box --> id='userid'
// Click continue --> id='signin-continue-btn'
// waitForSelector --> id='pass'
// Password box --> id='pass'
// wait a second
// click sign in ---> id='sgnBt'
// If url === https://accounts.ebay.com/acctsec/authn-register?
// Then click "Skip for now" --> id="passkeys-cancel-btn"
// Check if url === https://www.ebay.com/ (Makes sure user is signed in, not getting text verification)
// IF text verification, then add 2 factor with authy to bypass sending to phone number (Only code this IF necessary)

// Process to desired listing
// Look for "add to watchlist" --> id="watchBtn_btn_1"
// Click and check if button text changed to --> "Unwatch"
// Logout --> https://signin.ebay.com/ws/eBayISAPI.dll?SignIn&lgout=1&sgfl=gh

// After clicking "Sign in" could have captcha, or passkey page, THEN goes to home page OR ACCT BLOCKED page
// -------------------------------------------------------------------------------

//* Example url: https://www.ebay.com/itm/123

//  -------------------------------- Send watcher --------------------------------
export const sendWatcher = async (account, answers, i, module) => {
  const { url, useProxies } = answers;
  let browser = null;
  const retryDelay = 2000; // 2 seconds delay between retries;
  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      //  Create browser
      browser = await createBrowser(useProxies, account);

      // Create page
      let page = await browser.newPage();

      let solvingCaptcha = false;

      // ------ New approach here (Works on the initial captcha before email) ------
      // Listen for URL changes
      page.on("framenavigated", async (frame) => {
        if (frame.url().includes("https://www.ebay.com/splashui/captcha?")) {
          // if (frame.url().includes(urls.ebayUrls.captchaPage)) {
          solvingCaptcha = true;
          try {
            await handleCaptcha(page, module, i);
          } catch (error) {
            throw new Error(`Captcha handling failed: ${error.message}`);
          }
          solvingCaptcha = false;
        }
      });
      // -------------------------------

      // Go to login page
      await page.goto(urls.ebayUrls.signinPage);

      solvingCaptcha = await checkAndSolveCaptcha(
        page,
        module,
        i,
        solvingCaptcha
      );

      logger(module, `[Task #${i}] Filling in email`, "info");

      // Wait for email selector.. if dosen't show IP is bad and need to wait or be changed
      const emailSelector = page.locator(locators.signInPage.email);
      const submitButton = page.locator(locators.signInPage.signInContinueBtn);
      await emailSelector.waitFor();

      if (!emailSelector) {
        throw new Error(
          "Email selector not found. Bad proxy, or IP flagged wait and try again later."
        );
      }

      // Fill email
      await emailSelector.fill(account.email);
      await submitButton.click();

      // Check if sign in blocked
      const signInBlockedUrl = page.url();
      const passwordLocator = page.locator(locators.signInPage.password);
      const signInBtn = page.locator(locators.signInPage.signInBtn);

      if (
        signInBlockedUrl.startsWith(urls.ebayUrls.signinPage) &&
        !passwordLocator
      ) {
        throw new Error(
          `[${account.email}] - Sign in blocked. Try using different proxies or wait and try again later.`
        );
      }

      solvingCaptcha = await checkAndSolveCaptcha(
        page,
        module,
        i,
        solvingCaptcha
      );

      logger(module, `[Task #${i}] Filling in password`, "info");

      // Fill password
      await fillPasswordAndSignIn(passwordLocator, account.password, signInBtn);

      solvingCaptcha = await checkAndSolveCaptcha(
        page,
        module,
        i,
        solvingCaptcha
      );

      // Wait until the URL does not start with captcha url
      await page.waitForFunction(
        () =>
          !window.location.href.startsWith(
            "https://www.ebay.com/splashui/captcha?" // "urls.ebayUrls.captchaPage" throws an error?
          )
      );

      // check new url after login
      const newUrl = page.url();
      if (newUrl.startsWith(urls.ebayUrls.reSigninPage)) {
        logger(
          module,
          `[Task #${i}] Account flagged.. Refiling in password.`,
          "warn"
        );

        // If back to login url, reenter password
        await fillPasswordAndSignIn(
          passwordLocator,
          account.password,
          signInBtn
        );

        solvingCaptcha = await checkAndSolveCaptcha(
          page,
          module,
          i,
          solvingCaptcha
        );
      }

      // Skip passkey page
      await skipPasskeyPage(page, i);

      // Check for SMS verification page
      const curUrl = page.url();
      if (curUrl.includes(urls.ebayUrls.smsVerificationPage)) {
        logger(module, `[Task #${i}] SMS verification page detected`, "error");
        throw new Error(`[Task #${i}] SMS verification page detected`);
      }

      // Else, Log in successfully
      logger(module, `[Task #${i}] Logged in!`, "success");

      // If account is banned/suspended, this will inform the user. (Watching functionality still works for these accts.)
      await handleAccountSuspension(page, module, i, account);

      // Go to ebay listing
      logger(module, `[Task #${i}] Going to ebay listing`, "info");
      await page.goto(url);

      // Check here to determine if the account is already watching the item or not
      const watchItemLocator = page.locator(locators.watchers.watchItemBtn);

      // Get the text content of the button
      const buttonText = await watchItemLocator.textContent();

      // Add item to watch list
      await handleWatchItem(page, buttonText, watchItemLocator, module, i);

      // logout
      await logout(page, module, i);

      // End the loop
      break;
    } catch (error) {
      // logger(module, `[Task #${i}] Error Sending watcher: ${error}`, "error");
      logger(module, `[Task #${i}] ${error}`, "error");

      // Increment retry count
      retryCount++;

      if (retryCount < maxRetries) {
        logger(
          module,
          `[Task #${i}] Retrying in ${retryDelay / 1000} seconds...`,
          "info"
        );

        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        failedTasks.push({ i, email: account.email });
        throw error; // Rethrow the error to handle it in processWatcherTasks if needed
      }
    } finally {
      if (browser) {
        logger(module, `[Task #${i}] Closing browser..`, "info");
        // Close browser & reset
        await browser.close();
        browser = null;
      }
    }
  }
};

/* -------------------- Helper functions ------------------------------- */

async function checkAndSolveCaptcha(page, module, i, solvingCaptcha) {
  if (!solvingCaptcha) {
    try {
      await page.waitForSelector("#anchor", {
        timeout: 5000,
      });
      solvingCaptcha = true;

      try {
        await handleCaptcha(page, module, i);
      } catch (error) {
        throw new Error(`Captcha handling failed: ${error.message}`);
      } finally {
        solvingCaptcha = false;
      }
    } catch (e) {
      // console.log(`No captcha detected, proceeding...`);
      // No captcha detected, proceed
    }
  }
  return solvingCaptcha;
}

async function skipPasskeyPage(page, i) {
  try {
    await page.waitForSelector(locators.signInPage.passkeyCancelBtn, {
      timeout: 5000,
    });

    logger(module, `[Task #${i}] Skipping passkey page`, "info");

    await page.click(locators.signInPage.passkeyCancelBtn);
  } catch (error) {
    // No passkey page
  }
}

async function handleAccountSuspension(page, module, i, account) {
  try {
    // Wait for the h1 element with the specific text
    const welcomeMessage = page.locator(locators.signInPage.welcomeMsg, {
      hasText: "Your account has been suspended",
    });
    await welcomeMessage.waitFor({ timeout: 5000 });
    logger(
      module,
      `[Task #${i}] Account suspended, But still will watch item!`,
      "warn"
    );

    // Add suspended/banned property to user account
    account.banned = true;
    try {
      await processAccountUpdate(account);
    } catch (error) {
      console.error(`Error during account update process: ${error.message}`);
    }
    logger(module, `[Task #${i}] Account updated successfully.`, "info");

    // Click "Continue" button
    const continueBtn = page.locator(locators.signInPage.continueBtn);
    await continueBtn.click();
  } catch (e) {
    // Account is still valid, proceed
    logger(module, `Error checking account suspension: ${e.message}`, "error");
  }
}

async function fillPasswordAndSignIn(passwordLocator, password, signInBtn) {
  try {
    // Wait for the password input to be available
    await passwordLocator.waitFor();

    // Fill in the password
    await passwordLocator.fill(password);

    // Click the sign-in button
    await signInBtn.click();
  } catch (error) {
    throw new Error(`Failed to fill in password and sign in: ${error.message}`);
  }
}

async function handleWatchItem(page, buttonText, watchItemLocator, module, i) {
  if (buttonText.includes(locators.watchers.watchBtnText)) {
    logger(module, `[Task #${i}] Adding item to watch list`, "info");
    await watchItemLocator.click();

    // Wait for the button text to change to "Unwatch"
    await watchItemLocator.waitFor({
      hasText: locators.watchers.unwatchBtnText,
    });

    // Wait and check for the button text to change to "Unwatch"
    // await page
    //   .locator("button", { hasText: locators.watchers.unwatchBtnText })
    //   .waitFor({ timeout: 5000 });

    // Successfully added to watch list
    logger(module, `[Task #${i}] Watcher added successfully!`, "success");
  } else if (buttonText.includes(locators.watchers.unwatchBtnText)) {
    logger(
      module,
      `[Task #${i}] Item already in watch list. Skipping..`,
      "success"
    );
  }
}

async function logout(page, module, i) {
  logger(module, `[Task #${i}] Logging out..`, "info");
  await page.goto(urls.ebayUrls.logoutPage);
}

// ? If need to handle re-login..
// If it dosen't ask for text to phone number on account, were GOOD
// If it does, either go change the phone number on account OR add 2FA with auth app and make a function to read that!
async function blockedBySMS(page, module) {
  logger(module, `Checking for SMS page..`, "info");
  const smsVerificationNeeded = urls.ebayUrls.smsVerificationPage;

  // check by page content
  const smsPage = await page.getByRole("heading", {
    name: "Let’s verify it’s you",
  });

  if (smsPage) {
    return true;
  }

  // check by URL
  // const currentURL = await page.url();
  // if ((currentURL = smsVerificationNeeded)) {
  //   return true;
  // }

  return false;
}
