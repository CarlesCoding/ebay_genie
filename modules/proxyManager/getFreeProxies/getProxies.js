import inquirer from "inquirer";
import {
  parseProxyString,
  testProxiesConcurrently,
  testProxy,
} from "../proxy.js";
import { isValidCountryCode, saveData, sleep } from "../../../helpers.js";

// ? Possible site to use for free proxies https://geonode.com/free-proxy-list

export const handelGetProxies = async () => {
  const response = await inquirer.prompt([
    {
      type: "confirm",
      name: "save",
      message:
        "Would you like to overwrite the saved proxy list with the successful results?",
    },
    {
      type: "input",
      name: "country",
      message:
        "Which country do you want to use? (separate with a comma if multiple)",
      validate(code) {
        if (!code) {
          return "Please enter a country code.";
        }

        // Check code is only 2 characters && is a valid country code
        if (!isValidCountryCode(code)) {
          return "Please enter a valid country code. Example: 'US'";
        }

        return true;
      },
    },
    {
      type: "checkbox",
      name: "anonymity",
      message: "Which anonymity level do you want to use?",
      choices: ["elite", "anonymous", "transparent", "all"],
      validate(response) {
        if (!response.length) {
          return "Please select at least one option.";
        }

        if (response.includes("all") && response.length > 1) {
          return "Please select only one option if you want to use all levels.";
        }

        return true;
      },
    },
  ]);

  const { save, country, anonymity } = response;

  // Fetch url to scrape proxies from
  global.logThis("Fetching proxies...", "info");
  await getProxy(save, country, anonymity);
};

/**
 * Proxy Scraping Site:
 * https://docs.proxyscrape.com/
 * 
 * * Options:
 * Anonymity Lvl:
 * elite
 * anonymous
 * transparent
 * all

 * Protocol opts:
 * http
 * socks4
 * socks5
 * all
 */

const getProxy = async (
  save,
  country = "US",
  anonymity = "elite,anonymous"
) => {
  try {
    // Hard coded for now
    const protocol = "http";
    const timeout = 10000;
    const maxLatency = 5000;

    country = country.replace(/\s/g, "").trim().toUpperCase();

    // Create URL
    const url = `https://api.proxyscrape.com/v2/?request=displayproxies&protocol=${protocol}&timeout=${timeout}&country=${country}&anonymity=${anonymity}`;

    // Get Proxies
    const response = await fetch(url);

    // Check it was successful
    if (!response.ok) {
      throw new Error(
        `Network response was not OK. Status: ${response.status}`
      );
    }

    // Get response data
    const proxies = await response.text();

    // Split proxies by newline character
    const proxiesArray = proxies.split("\n");

    global.logThis(`[PROXY TESTER] - ${proxiesArray.length} proxies loaded.`);

    // Remove any empty strings from the array
    const filteredProxiesArray = proxiesArray.filter(
      (proxy) => proxy.trim() !== ""
    );

    const validProxies = await testProxiesConcurrently(filteredProxiesArray);

    global.logThis(`[PROXY TESTER] - Filtering proxies...`, "info");

    const filteredValues = validProxies.filter(
      (result) => result?.latency !== undefined && result?.latency <= maxLatency
    );

    // log to user
    global.logThis(
      `[PROXY TESTER] - Finished testing. There were ${filteredValues.length}/${proxiesArray.length} valid proxies.`,
      "success"
    );

    if (save && filteredValues.length > 0) {
      global.logThis(`[PROXY TESTER] - Saving proxies...`, "info");
      await saveData(filteredValues, "proxies", "overwrite");
    }

    await sleep(3000);
    global.runMain();
    return;
  } catch (error) {
    console.error(`Error fetching proxies = `, error);
  }
};
