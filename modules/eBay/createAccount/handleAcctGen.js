import inquirer from "inquirer";
import { handleCreateAcctGenTask } from "./Gen/createTask.js";
import { handleViewAcctGenTask } from "./Gen/viewTask.js";
import { handelRunAcctGenTask } from "./Gen/runTask.js";
import config from "../../../config/config.js";
import { connectAndExecuteAddressQuery } from "../../../utilities/db/db.js";

export const handleAccountGen = async () => {
  const response = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "eBay Account Generator:",
      choices: [
        "[1] Run Task",
        "[2] Create Task",
        "[3] View All Saved Task",
        "[4] Clear All Task",
        new inquirer.Separator(),
        "[5] Go Back",
      ],
    },
  ]);

  if (response.action === "[1] Run Task") {
    let saved = config.get("ebay-cli.tasks");
    if (saved.length > 0) {
      const taskArray = saved.filter((task) => {
        return task.module === "eBay Gen";
      });

      if (taskArray.length === 0)
        throw new Error("🔴 No eBay Gen tasks found!");

      // Get an address for every task in one go (prevents from being rate limited by the db.)
      const addressArray = await connectAndExecuteAddressQuery(
        taskArray.length
      );

      if (addressArray.length !== taskArray.length)
        throw new Error("🔴 Not all tasks have an address!");

      if (addressArray.length === 0)
        throw new Error("🔴 Failed to get addresses!");

      const runTasks = async () => {
        const promises = [];
        for (let i = 0; i < taskArray.length; i++) {
          const task = taskArray[i];
          task.address = addressArray[i];
          console.log(`Task ${i + 1}:`, task);
          const promise = handelRunAcctGenTask(task, i);
          promises.push(promise);
          // Add a small delay between each task starting (to avoid rate limiting)
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        await Promise.all(promises);
      };

      await runTasks();

      //* -- Temp --
      global.logThis("🟢 All tasks completed", "success");
    } else {
      global.logThis("🔴 No tasks found!", "error");
    }

    // await handelRunAcctGenTask();
  } else if (response.action === "[2] Create Task") {
    await handleCreateAcctGenTask();
  } else if (response.action === "[3] View All Saved Task") {
    await handleViewAcctGenTask();
  } else if (response.action === "[4] Clear All Task") {
    global.logThis("Clearing all tasks...", "info");
    let saved = config.get("ebay-cli.tasks");
    saved = [];
    config.set("ebay-cli.tasks", saved);
    global.logThis("🟢 All task cleared!", "success");
    await global.sleep(1500);
    global.runMain();
  } else if (response.action === "[5] Go Back") {
    global.runMain();
  }
};
