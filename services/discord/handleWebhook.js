import inquirer from "inquirer";
import config from "../../config/config.js";
import {
  log,
  promptPressToContinue,
  restartApp,
  sleep,
} from "../../helpers.js";
import AppError from "../../utilities/errorHandling/appError.js";

export const handleWebhookManager = async () => {
  try {
    let response = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Webhook Manager:",
        choices: [
          "[1] Add Webhook",
          "[2] View Webhooks",
          "[3] Delete Webhooks",
          new inquirer.Separator(),
          "[4] Go Back",
        ],
      },
    ]);

    // Handle response
    if (response.action === "[1] Add Webhook") {
      await handleAddWebhook();
      await restartApp(2500);
      return;
    } else if (response.action === "[2] View Webhooks") {
      await handleViewWebhooks();
      await restartApp(2500);
      return;
    } else if (response.action === "[3] Delete Webhooks") {
      await handleDeleteWebhook();
      await restartApp(2500);
      return;
    } else if (response.action === "[4] Go Back") {
      await restartApp();
      return;
    }
  } catch (error) {
    log(`❌ Webhook Error: ${error.message}`, "error");
    // Restart app
    await restartApp(3000);
    return;
  }
};

// ==================== WEBHOOK HANDLERS ====================

const handleAddWebhook = async () => {
  let webhookResponse = await inquirer.prompt([
    {
      type: "input",
      name: "webhook",
      message: "Enter webhook URL:",
      validate: (url) => {
        if (!url) return "Please enter a webhook URL.";

        // Check is valid url
        if (!url.includes("https://discord.com/api/webhooks/"))
          return "Please Enter a valid Discord Webhook URL.";

        // Return true if valid
        return true;
      },
    },
    {
      type: "input",
      name: "label",
      message: "Enter webhook label:",
      validate: (label) => {
        // Trim whitespace
        const trimmedLabel = label.trim();

        // Check if the input is empty after trimming
        if (!trimmedLabel) return "Please enter a webhook label.";

        // Limit length (example: max 50 characters)
        if (trimmedLabel.length > 50) {
          return "Webhook label must be 50 characters or less.";
        }

        // Only allow alphanumeric characters, spaces, hyphens, and underscores
        const safePattern = /^[a-zA-Z0-9-_ ]+$/;
        if (!safePattern.test(trimmedLabel)) {
          return "Webhook label can only contain letters, numbers, spaces, hyphens, and underscores.";
        }

        return true;
      },
    },
  ]);

  let saved = config.get("ebay-cli");

  // Set default value, if webhooks does not exist yet
  if (!saved.webhooks) {
    saved.webhooks = [];
  }

  // Check if webhook already exists
  if (
    saved.webhooks.some(
      (webhook) => webhook.webhook === webhookResponse.webhook
    )
  ) {
    throw new AppError("⚠️ Webhook already exists!", "error");
  }

  let webhookObj = {
    label: webhookResponse.label,
    webhook: webhookResponse.webhook,
  };

  // Add new webhook to config
  saved.webhooks.push(webhookObj);

  // Save the config
  config.set("ebay-cli", saved);

  log("🟢 Webhook added successfully!", "success");
  await sleep(2500);
  return;
};

const handleViewWebhooks = async () => {
  log("Fetching saved webhooks...", "info");

  let saved = config.get("ebay-cli");

  if (!saved.webhooks || saved.webhooks.length === 0) {
    throw new AppError("There are currently no webhooks saved.", "E_WEBHOOK");
  }

  // Create table to display webhooks
  console.table(saved.webhooks);

  // Prompt user to press any key to continue when done looking at providers
  await promptPressToContinue();
  return;
};

const handleDeleteWebhook = async () => {
  // Get saved webhooks
  let saved = config.get("ebay-cli");

  // Check if webhooks exist
  if (!saved.webhooks || saved.webhooks.length === 0) {
    throw new AppError("No webhooks found!", "error");
  }

  // Delete all webhooks
  saved.webhooks = [];

  // Save the config
  config.set("ebay-cli", saved);

  log("🟢 Webhooks deleted successfully!", "success");

  await sleep(2500);
  return;
};
