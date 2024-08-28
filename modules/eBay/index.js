import inquirer from "inquirer";
import { handleAddViews } from "./addViews/views.js";
import { handleAddWatchers } from "./addWatchers/handleWatchers.js";
import { handleAccountGen } from "./createAccount/handleAcctGen.js";

export const handleEbayManager = async () => {
  let response = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "Ebay Manager: Which module would you like to use?",
      choices: [
        "[1] Views",
        "[2] Watchers",
        "[3] Generate Accounts",
        new inquirer.Separator(),
        "[4] Go Back",
      ],
    },
  ]);

  if (response.action === "[1] Views") {
    await handleAddViews();
  } else if (response.action === "[2] Watchers") {
    await handleAddWatchers();
  } else if (response.action === "[3] Generate Accounts") {
    await handleAccountGen();
  } else if (response.action === "[4] Go Back") {
    global.runMain();
  }
};
