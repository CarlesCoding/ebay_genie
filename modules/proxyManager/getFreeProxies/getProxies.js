import inquirer from "inquirer";
import { parseProxyString, saveProxies, testProxy } from "../proxy.js";
import { isValidCountryCode } from "../../../helpers.js";

export const handelGetProxies = async () => {
  const response = await inquirer.prompt([
    {
      type: "confirm",
      name: "save",
      message:
        "Would you like to save/overwrite the saved proxy list with the successful results?",
    },
    {
      type: "input",
      name: "country",
      message:
        "Which country do you want to use? (separate with a comma if multiple)",
      when: (answers) => answers.action === "[2] Get Free Proxies",
      validate(code) {
        if (!code) {
          return "Please enter a country code.";
        }

        // Check code is only 2 characters && is a valid country code
        if (!isValidCountryCode(code)) {
          return "Please enter a valid country code.";
        }

        return true;
      },
    },
    {
      type: "checkbox",
      name: "anonymity",
      message: "Which anonymity level do you want to use?",
      choices: ["elite", "anonymous", "transparent", "all"],
      when: (answers) => answers.action === "[2] Get Free Proxies",
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

// TODO: Find a way to speed it all up (workers, threads, etc) - abort request helped.. well see if it needs optimized more

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

    country.replace(/\s/g, "").trim().toUpperCase();

    // Create URL
    const url = `https://api.proxyscrape.com/v2/?request=displayproxies&protocol=${protocol}&timeout=${timeout}&country=${country}&anonymity=${anonymity}`;

    // Save valid proxies
    const validProxies = [];

    // Get Proxies
    const response = await fetch(url);

    // Check it was successful
    if (!response.ok) {
      throw new Error(`Network response was not OK`);
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

    // Array to store promises
    let promises = [];

    // Create promises for testing proxies concurrently
    for (let proxy of filteredProxiesArray) {
      let formattedProxy = parseProxyString(proxy);
      if (formattedProxy) {
        promises.push(testProxy(formattedProxy, validProxies));
      }
    }

    // Wait for all promises to resolve
    const results = await Promise.allSettled(promises);

    global.logThis(`[PROXY TESTER] - Filtering proxies...`, "info");

    // Filter out elements that are not undefined && have a value >= X ms
    const filteredValues = results.filter(
      (result) =>
        result.value?.latency !== undefined &&
        result.value?.latency <= maxLatency
    );

    // Extract only the proxy value from each result
    const proxiesFromFilteredValues = filteredValues.map(
      (result) => result.value.proxy
    );

    // log to user
    global.logThis(
      `[PROXY TESTER] - Finished testing ${proxiesArray.length} proxies.`,
      "success"
    );

    global.logThis(
      `[PROXY TESTER] - There were ${filteredValues.length} valid proxies.`,
      "success"
    );

    if (save && proxiesFromFilteredValues.length > 0) {
      global.logThis(`[PROXY TESTER] - Saving proxies...`, "info");
      await saveProxies(proxiesFromFilteredValues);
    }
  } catch (error) {
    console.error(`errorGettingProxies = `, error);
  }
};
