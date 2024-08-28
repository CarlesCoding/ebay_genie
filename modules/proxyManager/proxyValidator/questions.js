import inquirer from "inquirer";
import { validateProxies } from "./validate.js";

export const handelProxyValidator = async () => {
  const response = await inquirer.prompt([
    {
      type: "confirm",
      name: "save",
      message:
        "Would you like to save/overwrite the saved proxy list with the successful results?",
    },
    {
      type: "list",
      name: "getProxiesFrom",
      message: "Which proxies do you want to test?",
      choices: ["Saved proxies", "Input proxies"],
    },
    {
      type: "editor",
      name: "proxyList",
      message: "Enter the proxy list to be validated",
      when: (answers) => answers.getProxiesFrom === "Input proxies",
      validate(text) {
        if (text.split("\n").length < 2) {
          return "Must be at least 2 lines.";
        }

        return true;
      },
      waitUserInput: true,
    },
  ]);

  // Test Proxies
  await validateProxies(response);
};
