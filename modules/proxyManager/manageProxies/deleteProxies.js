import inquirer from "inquirer";
import fs from "fs/promises";
import { getFilePath } from "../../../helpers.js";
import path from "path";

export const handleDeleteProxies = async () => {
  const response = await inquirer.prompt([
    {
      type: "confirm",
      name: "deleteAll",
      message: "Are you sure you want to delete all saved proxies?",
    },
  ]);

  const { deleteAll } = response;

  if (deleteAll) {
    // Get Proxy File
    const file = getFilePath("proxies");
    const filePath = path.join(process.cwd(), file);

    global.logThis("Deleting all saved proxies...", "info");

    // Delete everything in the file
    await fs.writeFile(filePath, "");

    global.logThis("Successfully deleted all saved proxies!", "success");

    await sleep(2000);

    global.runMain();
  } else {
    // Restart the program
    global.runMain();
  }
};
