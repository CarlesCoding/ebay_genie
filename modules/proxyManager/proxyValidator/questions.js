import inquirer from "inquirer";
import { validateProxies } from "./validate.js";

export const handelProxyValidator = async () => {
  const response = await inquirer.prompt([
    {
      type: "confirm",
      name: "save",
      message:
        "Would you like to overwrite the saved proxy list with the successful results?",
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
      message: "Enter the proxy list to be validated:",
      when: (answers) => answers.getProxiesFrom === "Input proxies",
      validate(text) {
        // Regular expression to validate proxy format
        const proxyRegex = /^(?:\d{1,3}\.){3}\d{1,3}:\d{1,5}(?::\S+:\S+)?$/;

        // Split text into lines
        const lines = text.trim().split("\n");

        // Check each line
        for (const line of lines) {
          if (!proxyRegex.test(line.trim())) {
            return "One or more proxies are invalid. Please ensure each proxy follows the correct format.";
          }
        }

        // If all lines are valid
        return true;
      },
      waitUserInput: true,
    },
  ]);

  // Test Proxies
  await validateProxies(response);
};
