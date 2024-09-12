import inquirer from "inquirer";
import { testProxiesConcurrently } from "../proxy.js";
import { saveData, sleep } from "../../../helpers.js";

export const handleAddProxies = async () => {
  const response = await inquirer.prompt([
    {
      type: "editor",
      name: "proxyList",
      message: "Paste your proxy list here:",
      validate(text) {
        if (text.split("\n").filter((line) => line.trim()).length < 1) {
          return "Must be at least 1 non-empty line.";
        }
        return true;
      },
      waitUserInput: true,
    },
    {
      type: "list",
      name: "overwriteOrAppend",
      message:
        "Would you like to add these to your saved proxies or overwrite your saved proxies?",
      choices: ["Append", "Overwrite"],
    },
    {
      type: "confirm",
      name: "testProxyBeforeSave",
      message: "Do you want to test these proxies before saving?",
    },
  ]);

  const { proxyList, overwriteOrAppend, testProxyBeforeSave } = response;

  // Check if proxies are loaded
  if (proxyList === null || proxyList.trim() === "") {
    global.logThis("No proxies loaded!", "error");
    await sleep(1500);
    global.runMain();
    return;
  }

  // Turn into an obj & Make array of proxies
  let proxiesToSave = proxyList.split("\n").map((proxy) => ({
    proxy: proxy.trim(),
    latency: 0,
  }));

  if (testProxyBeforeSave) {
    // Extract proxy strings for testing
    const proxiesToTest = proxiesToSave.map((proxyObj) =>
      proxyObj.proxy.trim()
    );

    // Test proxies
    global.logThis(
      `[PROXY TESTER] - Testing ${proxiesToTest.length} proxies...`,
      "info"
    );

    const validProxies = await testProxiesConcurrently(proxiesToTest);

    // If no proxies are valid, exit
    if (validProxies.length === 0) {
      global.logThis("[PROXY TESTER] - No valid proxies found.", "error");
      await sleep(1500);
      global.runMain();
      return;
      return;
    }

    // Create a lookup map of valid proxies
    const validProxyMap = new Map(
      validProxies.map(({ proxy, latency }) => [proxy, latency])
    );

    // Filter and update proxiesToSave
    proxiesToSave = proxiesToSave
      .filter((proxyObj) => validProxyMap.has(proxyObj.proxy)) // Keep only valid proxies
      .map((proxyObj) => ({
        ...proxyObj, // Keep other properties
        latency: validProxyMap.get(proxyObj.proxy), // Update latency
      }));
  }

  // Save as a json file
  global.logThis(
    `[PROXY TESTER] - Saving ${proxiesToSave.length} proxies to file.`,
    "info"
  );

  saveData(proxiesToSave, "proxies", overwriteOrAppend.toLowerCase());

  await sleep(3000);

  global.runMain();
  return;
};
