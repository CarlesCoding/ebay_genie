import { generatePassword, getRandomInt } from "../helpers.js";
import { faker } from "@faker-js/faker";
import { fetchRandomProxy } from "../modules/proxyManager/proxy.js";
import { withCaptchaHandler } from "./captchaHandler.js";
import { sleep } from "../helpers.js";
import AppError from "./errorHandling/appError.js";

// Scroll up & down randomly
// const randomPageScroll = async (page) => {
//   let scrollActionCount = 5;

//   while (scrollActionCount > 0) {
//     // Generate a random amount to scroll down
//     const scrollDownAmount = getRandomInt(10, 1000);

//     // Scroll down the random amount
//     await page.mouse.wheel(0, scrollDownAmount);

//     // Create a random wait time between 1 and 5 seconds
//     const randomWait = getRandomInt(1000, 4000);

//     // Generate a random amount to scroll up
//     const scrollUpAmount = getRandomInt(10, 1000);

//     // Wait the random wait time
//     await page.waitForTimeout(randomWait);

//     // Scroll up the random amount
//     await page.mouse.wheel(0, scrollUpAmount);

//     // Decrement the scroll action count
//     scrollActionCount--;
//   }

//   return page;
// };

// Scroll up & down randomly
// const randomPageScroll = async (page, direction, speed) => {
//   // info here - https://github.com/microsoft/playwright/issues/4302
//   let scroll = async (args) => {
//     const { direction, speed } = args;
//     const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//     const scrollHeight = () => document.body.scrollHeight;
//     const start = direction === "down" ? 0 : scrollHeight();
//     const shouldStop = (position) =>
//       direction === "down" ? position > scrollHeight() : position < 0;
//     const increment = direction === "down" ? 100 : -100;
//     const delayTime = speed === "slow" ? 50 : 10;
//     console.error(start, shouldStop(start), increment);
//     for (let i = start; !shouldStop(i); i += increment) {
//       window.scrollTo(0, i);
//       await delay(delayTime);
//     }
//   };

//   // Called like this
//   // await page.evaluate(scroll, { direction: "down", speed: "slow" });
//   // await page.evaluate(scroll, { direction: "up", speed: "fast" });
//   await page.evaluate(scroll, { direction: direction, speed: speed });

//   return page;
// };

//* NOT TESTED YET (Browser flags bypass this and go spright to captcha page)
export const randomPageScroll = async (page, speed) => {
  try {
    // Function to scroll the page
    let scroll = async (args) => {
      const { speed, duration } = args;

      const scrollHeight = () => document.body.scrollHeight;
      const viewHeight = window.innerHeight;
      const delayTime = speed === "slow" ? 200 : speed === "medium" ? 150 : 100; // Increased delay time for smoother scrolling (by px)
      const maxScrollIncrement = viewHeight / 10; // Smaller increment for less erratic scrolling

      let currentPosition = window.scrollY;
      let startTime = Date.now();

      // Function to randomly decide scroll direction and amount
      const getRandomScrollAmount = () =>
        Math.floor(Math.random() * maxScrollIncrement);
      const getRandomDirection = () => (Math.random() > 0.5 ? "down" : "up");

      const shouldStop = () =>
        currentPosition + viewHeight >= scrollHeight() ||
        currentPosition <= 0 ||
        Date.now() - startTime > duration;

      while (!shouldStop()) {
        let direction = getRandomDirection();
        let scrollAmount = getRandomScrollAmount();

        if (direction === "down") {
          currentPosition = Math.min(
            currentPosition + scrollAmount,
            scrollHeight() - viewHeight
          );
        } else {
          currentPosition = Math.max(currentPosition - scrollAmount, 0);
        }

        window.scrollTo(0, currentPosition);
        await sleep(delayTime);
      }
    };

    // Determine random duration between 4 to 10 seconds
    const randomDuration = (Math.floor(Math.random() * 7) + 4) * 1000; // 4 to 10 seconds in milliseconds

    console.log(`Scrolling page...`);
    // Execute the scroll with the specified speed and duration
    await page.evaluate(scroll, { speed: speed, duration: randomDuration });

    return page;
  } catch (error) {
    throw new AppError(
      `Error in randomPageScroll: ${error.message}`,
      `E_BOTPROTECTION`
    );
  }
  // Example usage:
  // await randomPageScroll(page, "slow");
};

// Get random user agent
export const getRandomUserAgent = () => {
  const userAgentList = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.2420.81",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux i686; rv:124.0) Gecko/20100101 Firefox/124.0",
  ];

  return userAgentList[Math.floor(Math.random() * userAgentList.length)];
};

// Add human like typing.This can help evade detection mechanisms that look for direct DOM manipulations.
export const humanTypeAdvanced = async (page, fields) => {
  try {
    await page.solveRecaptchas();

    const typeWithMistypes = async (field) => {
      const { selector, text } = field;

      // NEW not tested!
      await page.waitForSelector(selector);

      await page.click(selector);

      // Simulate typing with potential mistakes
      for (let i = 0; i < text.length; i++) {
        const char = text[i];

        // Randomly decide to mistype
        if (Math.random() < 0.1) {
          // 10% chance to mistype
          const wrongChar = String.fromCharCode(
            97 + Math.floor(Math.random() * 26)
          ); // Random lowercase letter
          await page.keyboard.type(wrongChar, {
            delay: Math.random() * 100 + 50,
          });
          await page.waitForTimeout(Math.random() * 100 + 50);
          await page.keyboard.press("Backspace");
          await page.waitForTimeout(Math.random() * 100 + 50);
        }

        // Type the correct character
        await withCaptchaHandler(page, async () => {
          await page.type(selector, char, { delay: Math.random() * 100 + 50 });
        });
        await page.waitForTimeout(Math.random() * 100 + 50);
      }

      // Simulate reviewing and correcting the text
      if (text.length > 1 && Math.random() < 0.3) {
        // 30% chance to make a correction
        const position = Math.floor(Math.random() * text.length);

        // Move cursor to random position within typed text
        for (let i = 0; i < text.length - position; i++) {
          await page.keyboard.press("ArrowLeft");
          await page.waitForTimeout(50);
        }

        // Delete the character at the specific position
        await page.keyboard.press("Backspace");
        await page.waitForTimeout(Math.random() * 100 + 50);

        // If the position is 0 then -1 would be undefined. Causing error. This check should help resolve that issue.
        if (position > 0) {
          await withCaptchaHandler(page, async () => {
            await page.type(selector, text[position - 1], {
              delay: Math.random() * 100 + 50,
            });
          });
        } else {
          await withCaptchaHandler(page, async () => {
            await page.type(selector, text[0], {
              delay: Math.random() * 100 + 50,
            });
          });
        }

        // Move cursor back to the end
        for (let i = 0; i < text.length - position - 1; i++) {
          await page.keyboard.press("ArrowRight");
          await page.waitForTimeout(50);
        }
      }
    };

    // Iterate over each field and simulate typing
    for (const field of fields) {
      await typeWithMistypes(field);
    }
  } catch (error) {
    throw new AppError(
      `Error typing like human: ${error.message}`,
      "E_BOTPROTECTION"
    );
  }
};

// Random mouse clicks at different positions on the page with random pauses between clicks
export const randomPageInteractions = async (page) => {
  try {
    // Additional random interactions (optional)
    for (let i = 0; i < 5; i++) {
      const viewport = await page.viewportSize();
      const x = getRandomInt(0, viewport.width);
      const y = getRandomInt(0, viewport.height);

      await page.mouse.click(x, y);
      await page.waitForTimeout(getRandomInt(1000, 3000));
    }

    return page;
  } catch (error) {
    throw new AppError(
      `Error performing random page interactions: ${error.message}`,
      "E_INTERACTION_FAILED"
    );
  }
};

// Simulate human-like mouse click
export const simulateHumanClick = async (page, selector) => {
  try {
    // Evaluate the element's bounding box
    const rect = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (!element)
        throw new AppError(`Element not found: ${selector}`, "E_BOTPROTECTION");
      const { top, left, bottom, right } = element.getBoundingClientRect();
      return { top, left, bottom, right };
    }, selector);

    // Calculate a random click position within the element
    const clickPosition = {
      x: rect.left + Math.random() * (rect.right - rect.left),
      y: rect.top + Math.random() * (rect.bottom - rect.top),
    };

    // Simulate more human-like mouse movement
    const moveMouseSmoothly = async (startX, startY, endX, endY) => {
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const x =
          startX + ((endX - startX) * i) / steps + (Math.random() - 0.5) * 2;
        const y =
          startY + ((endY - startY) * i) / steps + (Math.random() - 0.5) * 2;
        await page.mouse.move(x, y);
        await page.waitForTimeout(50 + Math.random() * 50); // Random delay between movements
      }
    };

    // Get current mouse position
    const { x: startX, y: startY } = await page.evaluate(() => {
      return { x: window.scrollX, y: window.scrollY };
    });

    // Move mouse smoothly to the target position
    await moveMouseSmoothly(startX, startY, clickPosition.x, clickPosition.y);

    // Click at the calculated position
    await page.mouse.click(clickPosition.x, clickPosition.y, {
      delay: 100 + Math.random() * 200,
    });
  } catch (error) {
    throw new AppError(
      `Error simulating human click: ${error.message}`,
      "E_BOTPROTECTION"
    );
  }
};

// -------------------------------- Fake account data -------------------------------

// Generate random user with proxy
export const generateDummyUser = async (task) => {
  // Generate random user data
  const userData = await generateRandomUserData(task.catchall);

  // Add address from task onto user here
  userData.address = task.address;

  if (task.useProxies) {
    try {
      let proxy = await fetchRandomProxy();
      userData.proxy = proxy;
    } catch (error) {
      throw new AppError(
        `Error getting random proxy when fetching new account data: ${error.message}`,
        `E_BOTPROTECTION`
      );
    }
  }

  return userData;
};

// Random user name
const createRandomUsername = () => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  if (firstName === "undefined" || lastName === "undefined") {
    createRandomUsername();
  }

  return { firstName, lastName };
};

// Generate random user data
export const generateRandomUserData = async (catchall = "gmail.com") => {
  try {
    // Generate random name
    const user = createRandomUsername();

    // Generate random name
    const email = `${user.firstName}.${user.lastName}${getRandomInt(
      1,
      10000
    )}@${catchall}`;

    // Generate random password
    const password = generatePassword(16); // Input password length

    // Check if any of the values are undefined
    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email,
      password,
    };

    const values = Object.values(userData);
    const hasUndefined = values.some((value) => value === undefined);

    if (hasUndefined) {
      throw new AppError("One or more values are undefined", `E_VALIDATION`);
    }

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email,
      password,
    };
  } catch (error) {
    throw new AppError(
      `Error generating random user data: ${error.message} || ${error}`,
      `E_BOTPROTECTION`
    );
  }
};
