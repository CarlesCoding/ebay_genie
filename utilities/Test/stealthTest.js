// playwright-extra is a drop-in replacement for playwright,
// it augments the installed playwright with plugin functionality
import { chromium } from "playwright-extra";
import LocateChrome from "locate-chrome";

// Load the stealth plugin and use defaults (all tricks to hide playwright usage)
// Note: playwright-extra is compatible with most puppeteer-extra plugins
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Add the plugin to playwright (any number of plugins can be added)
chromium.use(StealthPlugin());

// ...(the rest of the quickstart code example is the same)
chromium
  .launch({ headless: true, executablePath: await LocateChrome() })
  .then(async (browser) => {
    const page = await browser.newPage();

    console.log("Testing the stealth plugin..");
    await page.goto("https://bot.sannysoft.com", { waitUntil: "networkidle" });
    await page.screenshot({ path: "stealth.png", fullPage: true });

    console.log("All done, check the screenshot. ✨");
    await browser.close();
  });
