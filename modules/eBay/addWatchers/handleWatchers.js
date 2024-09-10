import inquirer from "inquirer";
import { questions } from "./questions.js";
import { getArrayOfAccounts, logger } from "../../../helpers.js";
import { sendWatcher } from "./sendWatcher.js";
import config from "../../../config/config.js";

const MAX_CONCURRENT_TASKS = config.get("MAX_CONCURRENT_TASKS");

export const handleAddWatchers = async () => {
  const answers = await inquirer.prompt(questions);
  const { watcherCount } = answers;
  const succeededTasks = [];
  const failedTasks = [];

  const accounts = await getArrayOfAccounts(watcherCount);
  const module = "eBay - Watchers";

  if (!accounts)
    throw new Error(
      `[Error in eBay Watchers] -- Task failed: No accounts found.`
    );

  try {
    // start task
    await processWatcherTasks(
      accounts,
      answers,
      succeededTasks,
      failedTasks,
      module
    );
  } catch (error) {
    logger(module, `Watcher Task failed: ${error.message}`, "error");
  }

  logger(
    module,
    `Finished adding watchers: ${succeededTasks.length} succeeded, ${failedTasks.length} failed`,
    "success"
  );
};

const processWatcherTasks = async (
  accounts,
  answers,
  succeededTasks,
  failedTasks,
  module
) => {
  // Keep track of the overall index so it does not restart on each batch of 3
  let overallIndex = 0;

  while (accounts.length > 0) {
    // Create an array of promises for up to 3 tasks
    const promises = accounts
      .splice(0, `${MAX_CONCURRENT_TASKS}`)
      .map((account, i) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const index = overallIndex + i + 1; // Calculate the global index
            console.log(`Task ${index} started...`);
            startTask(
              account,
              index,
              answers,
              succeededTasks,
              failedTasks,
              module
            )
              .then(resolve)
              .catch(resolve); // Ensure resolve is always called;
          }, i * 1000);
        });
      });

    // TODO: Refactor this so that if one throws an error it dosen't stop the whole process

    // Wait for all tasks to complete
    await Promise.allSettled(promises);

    // Update the overallIndex
    overallIndex += promises.length;

    // Add a small delay between each batch of tasks (to avoid rate limiting)
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
};

const startTask = async (
  account,
  i,
  answers,
  succeededTasks,
  failedTasks,
  module
) => {
  logger(module, `Sending watcher ${i}/${answers.watcherCount}`, "info");

  try {
    await sendWatcher(account, answers, i, module);
    succeededTasks.push({ i, email: account.email });
    logger(
      module,
      `Watcher ${i}/${answers.watcherCount} sent successfully!`,
      "success"
    );
  } catch (error) {
    failedTasks.push({ i, email: account.email });
    logger(module, `Watcher ${i}/${answers.watcherCount} failed!`, "error");
  }
};
