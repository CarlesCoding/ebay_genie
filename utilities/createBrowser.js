import locateChrome from "locate-chrome";
import {
  extractProxyInfo,
  getRandomProxy,
} from "../modules/proxyManager/proxy.js";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";
import config from "../config/config.js";
const API_KEY = config.get("ebay-cli.captcha.twocaptcha");

// To set custom user agent, start here:
// https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth/evasions/user-agent-override

export const createBrowser = async (useProxies, user) => {
  // Set up Playwright to solve captchas
  chromium.use(
    RecaptchaPlugin({
      provider: {
        id: "2captcha",
        token: API_KEY,
      },
    })
  );

  // Set up Stealth
  chromium.use(StealthPlugin());

  try {
    let browserConfig = {
      headless: false, // headless in production
      executablePath: await locateChrome(),
      ignoreHTTPSErrors: true,
      defaultViewport: { width: 1366, height: 768 },
      // slowMo: 250, // slow down execution for debugging
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-features=IsolateOrigins,site-per-process,SitePerProcess",
        "--disable-site-isolation-trials",
        "--disable-blink-features=AutomationControlled",
        // "--flag-switches-begin --disable-site-isolation-trials --flag-switches-end",
      ],
    };

    // Check if using proxies
    if (useProxies) {
      let proxy;

      if (user.proxy) {
        proxy = user.proxy;
      } else {
        proxy = await getRandomProxy();
      }

      let proxyData = extractProxyInfo(proxy);

      // Playwrite way (may work better with authed proxies)
      if (proxyData.username && proxyData.password) {
        browserConfig.proxy = {
          server: `http://${proxyData.ip}:${proxyData.port}`,
          username: proxyData.username,
          password: proxyData.password,
        };
      } else {
        browserConfig.proxy = {
          server: `http://${proxyData.ip}:${proxyData.port}`,
        };
      }
    }

    // launch browser
    let browser = await chromium.launch(browserConfig);

    return browser;
  } catch (error) {
    throw new Error(`Error creating browser: ${error.message}`);
  }
};
