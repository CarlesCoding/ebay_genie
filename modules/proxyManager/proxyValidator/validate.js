import {
  extractProxyInfo,
  getProxyFile,
  parseProxyString,
  saveProxies,
  testProxy,
} from "../proxy.js";

export const validateProxies = async (response) => {
  const { save, getProxiesFrom, proxyList } = response;
  let proxiesToTest;

  // Save valid proxies
  const validProxies = [];

  try {
    // Get Proxies
    proxiesToTest =
      getProxiesFrom === "Saved proxies" ? await getProxyFile() : proxyList;

    // Check if proxies are loaded
    if (proxiesToTest === null) {
      global.logThis("No proxies loaded!", "error");
      await sleep(1500);
      global.runMain();
    }

    // ------------------------ TEST PROXIES ------------------------
    proxiesToTest = proxiesToTest.split("\n");

    global.logThis(
      `[PROXY TESTER] - Testing ${proxiesToTest.length} proxies...`,
      "warn"
    );

    // Array to store promises
    let promises = [];

    // Create promises for testing proxies concurrently
    for (let proxy of proxiesToTest) {
      let formattedProxy = parseProxyString(proxy);
      if (formattedProxy) {
        promises.push(testProxy(formattedProxy, validProxies));
      }
    }

    // Wait for all promises to resolve
    await Promise.allSettled(promises);

    // log to user
    global.logThis(
      `[PROXY TESTER] - Finished testing ${proxiesToTest.length} proxies.`,
      "success"
    );

    // Save/Overwrite the proxies.txt file
    if (save) {
      global.logThis(
        `[PROXY TESTER] - Saving ${validProxies.length} valid proxies...`,
        "info"
      );
      saveProxies(validProxies);
      global.logThis(
        `[PROXY TESTER] - Saved ${validProxies.length} proxies!`,
        "success"
      );
    } else {
      // Display in console
      global.logThis(
        `[PROXY TESTER] - [${
          validProxies.length
        } Valid Proxies]:\n${validProxies.join("\n")}!`,
        "success"
      );
    }

    await sleep(10000);
    global.runMain();
  } catch (error) {
    //  console.log(`Error: ${e.message}`);
    global.logThis(
      `[PROXY TESTER] - [Error] -> Error with proxy validation.`,
      "error"
    );
  }
};

// ------------------------ HELPER FUNCTIONS ------------------------
