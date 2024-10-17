import inquirer from "inquirer";
import config from "../../../../config/config.js";
import { v4 as uuidv4 } from "uuid";
import { log, restartApp, sleep } from "../../../../helpers.js";
import AppError from "../../../../utilities/errorHandling/appError.js";

export const handleCreateAcctGenTask = async () => {
  try {
    //  Get imap info
    let savedImap = config.get("ebay-cli.imap");
    let savedWebhooks = config.get("ebay-cli.webhooks");

    // Check if imap is empty
    if (!savedImap.length) {
      log("No IMAP saved.", "error");
      return restartApp(1500);
    }

    if (!savedWebhooks.length) {
      log("No webhooks saved.", "error");
      return restartApp(1500);
    }

    // Get Task Info
    let ebayGen = await inquirer.prompt([
      {
        type: "confirm",
        name: "useCatchall",
        message: "Would you like to use a catchall?",
      },
      {
        type: "input",
        name: "catchall",
        message: "Catchall:",
        when: (answers) => answers.useCatchall === true,
      },
      {
        type: "input",
        name: "taskQty",
        message: "How many tasks would you like to create?",
        validate: (value) => {
          if (isNaN(value)) {
            return "Please enter a number.";
          }

          if (value < 1 || value > 100) {
            return "Please enter a number between 1 and 100.";
          }

          return true;
        },
      },
      {
        type: "list",
        name: "imap",
        message: "IMAP Account:",
        choices: savedImap.map((x) => x.email),
      },
      {
        type: "list",
        name: "simProvider",
        message: "Which sim provider would you like to use?",
        choices: ["sms-activate", "fivesim", "textverified"],
      },
      {
        type: "confirm",
        name: "useProxies",
        message: "Use proxies?",
      },
      {
        type: "list",
        name: "webhook",
        message: "Which webhook would you like to use?",
        choices: savedWebhooks.map((x) => x.label),
      },
    ]);

    // Get saved tasks
    let saved = config.get("ebay-cli.tasks");

    // Push to tasks
    for (let i = 0; i < ebayGen.taskQty; i++) {
      // Default catchall to gmail if none specified
      ebayGen.useCatchall === false
        ? (ebayGen.catchall = "gmail.com")
        : (ebayGen.catchall = ebayGen.catchall);

      saved.push({
        id: uuidv4(),
        module: "eBay Gen",
        catchall: ebayGen.catchall,
        imap: ebayGen.imap,
        simProvider: ebayGen.simProvider,
        useProxies: ebayGen.useProxies,
        webhook: ebayGen.webhook,
      });
    }

    // Save tasks
    config.set("ebay-cli.tasks", saved);

    log(`🟢 ${ebayGen.taskQty} Tasks created!`, "success");

    // Restart main
    await restartApp(1500);
    return;
  } catch (error) {
    throw new AppError(`Failed to create task: ${error.message}`, "E_TASK");
  }
};
