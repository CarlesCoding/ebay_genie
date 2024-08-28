import inquirer from "inquirer";
import { getProxyFile, saveProxies } from "../proxy.js";

export const handleAddProxies = async () => {
  const response = await inquirer.prompt([
    // Optional: Can add a question - "Test Proxies before save?"
    {
      type: "editor",
      name: "proxyList",
      message: "Paste your proxy list here",
      validate(text) {
        if (text.split("\n").length < 1) {
          return "Must be at least 1 lines.";
        }

        return true;
      },
      waitUserInput: true,
    },
    {
      type: "list",
      name: "saveOrAppend",
      message:
        "Would you like to add these to your saved proxies or overwrite your saved proxies?",
      choices: ["Append", "Overwrite"],
    },
  ]);

  const { proxyList, saveOrAppend } = response;

  // Check if proxies are loaded
  if (proxyList === null) {
    global.logThis("No proxies loaded!", "error");
    await sleep(1500);
    global.runMain();
  }

  // Make array of proxies
  let proxiesToSave = proxyList.split("\n");

  if (saveOrAppend === "Append") {
    // Append proxies to saved proxies
    global.logThis(
      `[PROXY TESTER] - Appending ${proxiesToSave.length} proxies to saved proxies...`,
      "info"
    );
    const savedProxies = await getProxyFile();
    const savedProxiesFormatted = new Set(savedProxies.split("\n"));

    const newList = Array.from(
      new Set([...proxiesToSave, ...savedProxiesFormatted])
    );

    // Save proxies
    saveProxies(newList);
  } else {
    // Overwrite saved proxies
    global.logThis(
      `[PROXY TESTER] - Saving ${proxiesToSave.length} valid proxies...`,
      "info"
    );
    saveProxies(proxiesToSave);
  }

  await sleep(2000);

  global.runMain();
};
