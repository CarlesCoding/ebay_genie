import inquirer from "inquirer";
import fs from "fs/promises";
import path from "path";
import { deleteData } from "../../../helpers.js";

export const handleDeleteProxies = async () => {
  const response = await inquirer.prompt([
    {
      type: "confirm",
      name: "deleteAll",
      message: "Are you sure you want to delete all saved proxies?",
    },
  ]);

  if (response.deleteAll) {
    await deleteData("proxies");
  }

  global.runMain();
  return;
};
