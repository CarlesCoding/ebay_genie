import { chromium } from "playwright-extra";
import LocateChrome from "locate-chrome";
import config from "../../config/config.js";
const API_KEY = config.get("ebay-cli.captcha.twocaptcha");
// import StealthPlugin from "puppeteer-extra-plugin-stealth";
import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";
// const RecaptchaOptions = {
//   visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
//   provider: {
//     id: "2captcha",
//     token: API_KEY,
//   },
// };
// chromium.use(RecaptchaPlugin(RecaptchaOptions));
chromium.use(
  RecaptchaPlugin({
    provider: {
      id: "2captcha",
      token: API_KEY,
    },
  })
);
// chromium.use(StealthPlugin());

(async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: await LocateChrome(),
  });

  let page = await browser.newPage();

  await page.goto("https://tinyurl.com/2y4h87yd");

  const { solved, error } = await page.solveRecaptchas();

  if (solved) {
    console.log(`✔️ The captcha has been solved!`);
  }
})();
