import inquirer from "inquirer";
import { handelGetProxies } from "./getFreeProxies/getProxies.js";
import { handleAddProxies } from "./manageProxies/addProxies.js";
import { handleDeleteProxies } from "./manageProxies/deleteProxies.js";
import { handelProxyValidator } from "./proxyValidator/questions.js";
import { handleViewProxies } from "./manageProxies/viewProxies.js";

export const handleProxyManager = async () => {
  // const response = await inquirer.prompt(questions);
  const response = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "Proxy Manager:",
      choices: [
        "[1] Test All",
        "[2] View All Saved",
        new inquirer.Separator(),
        "[3] Add Proxies",
        "[4] Delete All Saved",
        "[5] Get Free Proxies",
        "[6] Go Back",
      ],
    },
  ]);

  if (response.action === "[1] Test All") {
    await handelProxyValidator();
  } else if (response.action === "[2] View All Saved") {
    await handleViewProxies(); // MAYBE IN A TABLE - 'proxy' - 'status (Alive || Dead) - 'latency'
  } else if (response.action === "[3] Add Proxies") {
    await handleAddProxies();
  } else if (response.action === "[4] Delete All Saved") {
    await handleDeleteProxies();
  } else if (response.action === "[5] Get Free Proxies") {
    await handelGetProxies();
  } else if (response.action === "[6] Go Back") {
    global.runMain();
  }
};
