import { logger } from "../helpers.js";
import AppError from "./errorHandling/appError.js";
import { urls } from "./urls.js";

//  -------------------------- Ebay Watcher --------------------------

// Function to check for captchas
export const checkForCaptchas = async (page) => {
  const captchaEl = await page.locator("#captcha_form");

  // Check if the element is visible
  const isVisible = await captchaEl.isVisible();

  if (captchaEl && isVisible) {
    console.log("Captcha detected");

    await page.solveRecaptchas();

    console.log("Captcha solved, redirecting...");

    await page.waitForNavigation();
  } else {
    console.log("No captcha detected");
  }
};

// export const checkForCaptchas = async (page) => {
//   const urlCheck = page.url();
//   const captchaUrl = "https://www.ebay.com/splashui/captcha?";
//   const captchaEl = page.locator("#captcha_form");

//   // Check if the URL starts with the captcha URL or if the captcha element is present and visible
//   if (urlCheck.startsWith(captchaUrl) || (await captchaEl.isVisible())) {
//     console.log("Captcha detected");

//     await page.solveRecaptchas();

//     console.log("Captcha solved, redirecting...");

//     // Wait for navigation after solving the captcha
//     await page.waitForNavigation();
//   } else {
//     console.log("No captcha detected");
//   }
// };

// Function to check for captchas elements while performing an action
export const performActionWithCaptchaCheck = async (
  page,
  action,
  actionDescription
) => {
  const checkInterval = 1000;
  let actionCompleted = false;

  const captchaMonitor = setInterval(async () => {
    await checkForCaptchas(page);
  }, checkInterval);

  try {
    console.log(`Performing ${actionDescription}...`);
    await action();
    actionCompleted = true;
    console.log(`Action completed: ${actionDescription}`);
  } finally {
    clearInterval(captchaMonitor);
    if (!actionCompleted) {
      console.log(`Action failed: ${actionDescription}`);
    }
  }
};

// (Use this) Function to handle captchas
export const handleCaptcha = async (page, module, i) => {
  logger(module, `[Task #${i}] Handling CAPTCHA...`, "info");

  await page.waitForTimeout(1500);

  try {
    const { captchas, filtered, solutions, solved, error } =
      await page.solveRecaptchas();

    if (solved.length === 0) {
      logger(module, `[Task #${i}] Failed to solve captcha`, "error");
      throw new Error(`Failed to solve captcha`);
    }
  } catch (error) {
    throw new AppError(
      `[Task #${i}] Failed to solve captcha. ${error.message}`,
      `E_CAPTCHA`
    );
  }
  await page.waitForNavigation();
  logger(module, `[Task #${i}] CAPTCHA solved,`, "success");
};

// (Backup function) Function to detect and handle captcha
export const detectAndSolveCaptcha = async (page) => {
  try {
    // Wait for the URL to match the main part indicating navigation
    await page.waitForURL((url) => url.startsWith(urls.ebayUrls.captchaPage), {
      //https://www.ebay.com/splashui/captcha?
      timeout: 10000,
    });

    // Check if the URL contains the main part
    if (page.url().includes(urls.ebayUrls.captchaPage)) {
      // https://www.ebay.com/splashui/captcha?
      await handleCaptcha(page);
    }
  } catch (e) {
    console.log("No captcha detected or navigation timeout.");
  }
};

// -------------------------- Ebay Gen ----------------------------------
export const monitorAndSolveCaptcha = (page, i, module, note) => {
  // Define a function to handle captcha resolution
  const handleCaptcha = async () => {
    page.on("framenavigated", async (frame) => {
      const url = frame.url();
      if (url.includes("hcaptcha") && url.includes("frame=challenge")) {
        logger(
          module,
          `[Task #${i + 1}] Captcha detected. Solving it... ${note}`,
          "info"
        );

        const { captchas, filtered, solutions, solved, error } =
          await page.solveRecaptchas();

        console.log({ captchas, filtered, solutions, solved, error });
        if (solved && solved.length !== 0) {
          logger(
            module,
            `[Task #${i + 1}] Captcha bypassed! ✔️ ${note}`,
            "info"
          );
        } else {
          console.log(`Error solving captcha`);
          throw new AppError(`Error solving captcha`, `E_CAPTCHA`);
        }
      }
    });
  };

  // Run handleCaptcha in a non-blocking manner
  handleCaptcha().catch((error) => {
    // console.error(`Failed to solve captcha: ${error.message}`);
    throw new AppError(
      `Failed to solve captcha: ${error.message}`,
      `E_CAPTCHA`
    );
  });
};

// Wrapper function for captcha handling (Used in human typing function)
// export const withCaptchaHandler = async (page, action) => {
//   await action();
//   await solveCaptcha(page);
// };

// Same as above but with error handling
export const withCaptchaHandler = async (page, action) => {
  try {
    await action();
  } catch (error) {
    throw new AppError(
      `Failed to perform action: ${error.message}`,
      `E_CAPTCHA`
    );
    // Rethrow to propagate the error
  }

  try {
    await solveCaptcha(page); // Attempt to solve the captcha
  } catch (error) {
    throw new AppError("Failed to solve captcha", "E_CAPTCHA");
  }
};

// Solve Captcha (used in withCaptchaHandler())

const solveCaptcha = async (page) => {
  const captchaSelector = ".g-recaptcha, .h-captcha";

  if (await page.$(captchaSelector)) {
    console.log("Captcha detected, solving...");

    const { solved } = await page.solveRecaptchas();

    if (!solved) {
      throw new AppError("Failed to solve captcha", "E_CAPTCHA");
    }

    console.log("Captcha solved!");
  }

  return true;
};

// Monitor for captcha and solve it (GOOD)
// function is set to detect captchas dynamically during navigation.
// export const monitorAndSolveCaptcha = async (page, i, module, note) => {
//   console.log({ i, module });
//   page.on("framenavigated", async (frame) => {
//     // testing for when pages url dosen't change when captcha is there
//     const url = frame.url();
//     if (url.includes("hcaptcha") && url.includes("frame=challenge")) {
//       // console.log("Captcha detected. Solving it...");
//       logger(
//         module,
//         `[Task #${i + 1}] Captcha detected. Solving it... ${note}`,
//         "info"
//       );

//       const { captchas, filtered, solutions, solved, error } =
//         await page.solveRecaptchas();

//       // TODO: Test just solving the first captcha it gets. (Try and reduce how many times its triggered and logs to user)
//       console.log({ captchas, filtered, solutions, solved, error });
//       if (solved && solved.length !== 0) {
//         logger(module, `[Task #${i + 1}] Captcha bypassed! ✔️ ${note}`, "info");
//       } else {
//         console.log(`Error solving captcha`);
//         throw new Error(`Error solving captcha`);
//       }
//     }
//   });
// };

// TODO: Captcha problem - Need to solve (low priority) - Usually changed proxies fix this issue
// look for "init" from network tab (This is where the captcha is created)
// ebay sitekey =  195eeb9f-8f50-4a9c-abfc-a78ceaa3cdde
// On flagged accounts when logging in i get a different kind ot captcha
// URL for this one is: https://www.ebay.com/signin/captcharouter_challenge?ap=1&iim=jMTczLjG&iia=sjIwNS44US&iiz=DqFNS41OQ**hMd&ru=https%3A%2F%2Fwww.ebay.com%2Fsignin%2Fsrv%2Fidentifer&iid=c09093ef-0e8a-417a-a9df-45eaa8812549
// url to send the captcha to solve: https://api.hcaptcha.com/checkcaptcha/SITEKEY/CAPTCHA_ANSWER
// Once solved it changes to: https://www.ebay.com/signin/captcharouter_captchadone

// url to send the captcha to solve Example:https://api.hcaptcha.com/checkcaptcha/195eeb9f-8f50-4a9c-abfc-a78ceaa3cdde/W1_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.3gADpGRhdGHFAa_q4-KJnD-LRN6D2TmGhfqaRlmfKKP4vxkrCJDJnk5KijQvGmtwh8ctNi-VMb6RLlYl2F7i9s06J4omUXjy4W8eKCzoV46zfoc3zxFzZU6DK8GoNcAH2lUDUbtSBjBbtvaK1DTY42qkfaAg6rA8wx0CU3LvtknmuJjKRqANdovf06BCD8ziEMzF-e4MiWaWtz-qVuz2117Pa1QqgiP8okOF0njzgXQiuEE10TpYNwcv-noSKxAJvyXJcQiL5ZZZ4jJpV0dE7EPHmyVgcO3TW5R0BT_Kjoc2FrJbaSoqQbFidYvxsAqZW94FRRr8oIEEKOTMQ5oY6wz66fYCUA9MrhhJ6TDMSDhIti_dJRb_lMcZ_1tYLdxsadV5QqD4st_9chfO2nrEnAjdGZSBqR3iiTuzUbuznNBXiZUfY4DukpwXx05kUlSKMnWUBv6r7aY3Dr3mq5zyJwi_X28u-9-oZBjY3q3E1PWGkaex5YF6gMyKwml4aT-PhFTVS55xKgLTWL4NpZhjiupFOteicfuHk1SgO2XTc-Cg9SEn37gxhGYLItIepjgt4ADs497wLqKul6NleHDOZo3ji6Jrcqg0YWZhMjg4Ng.ydi1qq7ac1yM8dOHU5J16vZDGstDNCAGzFJXMwl9578
