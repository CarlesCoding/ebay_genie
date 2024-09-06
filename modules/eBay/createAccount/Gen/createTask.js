import inquirer from "inquirer";
import config from "../../../../config/config.js";
import { v4 as uuidv4 } from "uuid";

export const handleCreateAcctGenTask = async () => {
  try {
    //  Get imap info
    let savedImap = config.get("ebay-cli.imap");

    // Check if imap is empty
    if (savedImap.length === 0) {
      global.logThis("No IMAP saved.", "error");
      await global.sleep(1500);
      global.runMain();
      return;
    } else {
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
        });
      }

      // Save tasks
      config.set("ebay-cli.tasks", saved);

      global.logThis(`🟢 ${ebayGen.taskQty} Tasks created!`, "success");

      await global.sleep(1500);

      // Restart main
      global.runMain();
      return;
    }
  } catch (error) {
    console.error(`Error in handleCreateAcctGenTask:`, error);
  }
};
