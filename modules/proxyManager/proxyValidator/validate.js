import { saveData, sleep } from "../../../helpers.js";
import { getFile, testProxiesConcurrently } from "../proxy.js";

export const validateProxies = async (response) => {
  const { save, getProxiesFrom, proxyList } = response;
  let proxiesToTest;

  // Get Proxies
  try {
    if (getProxiesFrom === "Saved proxies") {
      const proxies = await getFile("proxies");

      // Extract proxy strings from JSON objects
      proxiesToTest = proxies.map((proxyObj) => proxyObj.proxy.trim());
    } else {
      // Convert input list to array of proxy strings
      proxiesToTest = proxyList.split("\n").map((proxy) => proxy.trim());
    }

    // Check if proxies are loaded
    if (!proxiesToTest || proxiesToTest.length === 0) {
      global.logThis("No proxies loaded!", "error");
      await sleep(1500);
      global.runMain();
      return;
    }

    global.logThis(
      `[PROXY TESTER] - Testing ${proxiesToTest.length} proxies...`,
      "warn"
    );

    const validProxies = await testProxiesConcurrently(proxiesToTest);

    // log to user
    global.logThis(
      `[PROXY TESTER] - Finished testing ${proxiesToTest.length} proxies.`,
      "success"
    );

    // If no proxies are valid, exit
    if (validProxies.length === 0) {
      global.logThis("[PROXY TESTER] - No valid proxies found.", "error");
      await sleep(1500);
      global.runMain();
      return;
    }

    // Save/Overwrite the proxies file
    if (save) {
      global.logThis(
        `[PROXY TESTER] - Saving ${validProxies.length} valid proxies...`,
        "info"
      );

      saveData(validProxies, "proxies", "overwrite");

      global.logThis(
        `[PROXY TESTER] - Saved ${validProxies.length} proxies!`,
        "success"
      );
    } else {
      // Display in console
      global.logThis(
        `[PROXY TESTER] - There are [${validProxies.length}/${proxiesToTest.length}] valid proxies.`,
        "success"
      );

      // Display in console
      validProxies.forEach((proxy) => {
        global.logThis(proxy.proxy, "success");
      });
    }

    await sleep(5000);
    global.runMain();
    return;
  } catch (error) {
    //  console.log(`Error: ${e.message}`);
    global.logThis(
      `[PROXY TESTER] - [Error] -> Error with proxy validation. Error: ${error}`,
      "error"
    );
  }
};
