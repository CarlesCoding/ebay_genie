import inquirer from "inquirer";
import { notDevelopedYet } from "../../utilities/404.js";
import config from "../../config/config.js";
import { v4 as uuidv4 } from "uuid";
import { checkBalance } from "../../services/SMS/checkAllBalances.js";
import {
  shortenApiKey,
  sleep,
  createSpinner,
  promptPressToContinue,
  log,
  restartApp,
} from "../../helpers.js";
import { handleWebhookManager } from "../../services/discord/handleWebhook.js";
import AppError from "../../utilities/errorHandling/appError.js";
import { checkCaptchaBalances } from "../../services/captcha/checkAllBalances.js";

export const handleEditSettings = async () => {
  try {
    let response = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "AIO Settings:",
        choices: [
          "[1] Captcha",
          "[2] IMAP",
          "[3] SMS",
          "[4] Webhooks",
          new inquirer.Separator(),
          "[5] Go Back",
        ],
      },
    ]);

    if (response.action === "[1] Captcha") {
      try {
        let captchaRes = await inquirer.prompt([
          {
            type: "list",
            name: "action",
            message: "Captcha Manager:",
            choices: [
              "[1] Add Captcha Provider",
              "[2] View saved Captcha Providers",
              "[3] Clear All Providers",
              new inquirer.Separator(),
              "[4] Go Back",
            ],
          },
        ]);
        if (captchaRes.action === "[1] Add Captcha Provider") {
          let captchaRes2 = await inquirer.prompt([
            {
              type: "list",
              name: "provider",
              message: "Captcha Provider:",
              choices: ["2captcha"], // "CapMonster", "CapSolver" will be added later
            },
            {
              type: "input",
              name: "apiKey",
              message: "Paste API Key:",
            },
          ]);
          let saved = await config.get("ebay-cli");
          if (!saved.captcha) {
            saved.captcha = {
              twocaptcha: { key: "", balance: 0 },
              capmonster: { key: "", balance: 0 },
              capsolver: { key: "", balance: 0 },
            };
          }

          if (captchaRes2.provider === "2captcha") {
            saved.captcha.twocaptcha.key = captchaRes2.apiKey;
          } else if (captchaRes2.provider === "CapMonster") {
            saved.captcha.capmonster.key = captchaRes2.apiKey;
          } else if (captchaRes2.provider === "CapSolver") {
            saved.captcha.capsolver.key = captchaRes2.apiKey;
          }

          config.set("ebay-cli", saved);
          log("🟢 Captcha Provider updated!", "success");
          await restartApp(2500);
        } else if (captchaRes.action === "[2] View saved Captcha Providers") {
          // Create spinner
          let spinner = createSpinner(`Fetching Providers...`);
          try {
            let saved = await config.get("ebay-cli");
            if (!saved.captcha) {
              log("❌ No Captcha Providers saved!", "error");
              return;
            }

            // Start loading spinner
            spinner.start();

            // Create table to display webhooks
            let tableData = Object.entries(saved.captcha).map(
              ([name, { key, balance = 0 }]) => ({
                Name: name,
                Key: key,
                Balance: balance,
              })
            );

            // Update tableData with the latest balance for each provider directly
            await Promise.all(
              tableData.map(async (provider) => {
                provider.Balance = await checkCaptchaBalances(
                  provider.Name,
                  provider.Key
                );
              })
            );

            // Stop spinner
            spinner.stop();
            log("🟢 Captcha Providers:", "success");
            console.table(tableData);

            await promptPressToContinue();
            await restartApp();
          } catch (error) {
            spinner.stop();
            throw error;
          }
        } else if (captchaRes.action === "[3] Clear All Providers") {
          let saved = await config.get("ebay-cli");
          if (saved.captcha) {
            saved.captcha = {
              twocaptcha: "",
              capmonster: "",
              capsolver: "",
            };
            config.set("ebay-cli", saved);
            log("🟢 Captcha Providers cleared!", "success");
          } else {
            log("❌ No Captcha Providers saved!", "error");
          }

          await restartApp(2500);
        } else if (captchaRes.action === "[4] Go Back") {
          await restartApp();
        }
      } catch (error) {
        throw new AppError(
          `Error with Captcha Manager: ${error.message}`,
          "E_SETTINGS"
        );
      }
    } else if (response.action === "[2] IMAP") {
      try {
        let imapRes = await inquirer.prompt([
          {
            type: "list",
            name: "action",
            message: "IMAP Manager:",
            choices: [
              "[1] Add IMAP Provider",
              "[2] View saved IMAP Providers",
              "[3] Clear All Providers",
              new inquirer.Separator(),
              "[4] Go Back",
            ],
          },
        ]);

        // Add IMAP Provider
        if (imapRes.action === "[1] Add IMAP Provider") {
          let options = [
            {
              label: "GMAIL",
              value: "imap.gmail.com",
            },
            {
              label: "Yahoo",
              value: "imap.mail.yahoo.com",
            },
            {
              label: "Outlook",
              value: "imap-mail.outlook.com",
            },
            {
              label: "AOL",
              value: "imap.aol.com",
            },
            {
              label: "iCloud",
              value: "imap.mail.me.com",
            },
            {
              label: "Zoho",
              value: "imap.zoho.com",
            },
            {
              label: "FastMail",
              value: "imap.fastmail.com",
            },
            {
              label: "GMX",
              value: "imap.gmx.com",
            },
            {
              label: "Yandex",
              value: "imap.yandex.com",
            },
          ];
          let addImapRes = await inquirer.prompt([
            {
              type: "list",
              name: "action",
              message: "IMAP Provider:",
              choices: options.map((x) => x.label),
            },
            {
              type: "input",
              name: "email",
              message: "IMAP Email:",
            },
            {
              type: "password",
              name: "password",
              message:
                "IMAP Password (If 2FA is enabled, check if you need an app password - then use that!):",
            },
          ]);

          let obj = {
            email: addImapRes.email,
            password: addImapRes.password,
            provider: options.find((x) => x.label === addImapRes.action).value,
            id: uuidv4(),
          };
          let saved = await config.get("ebay-cli");
          if (!saved.imap) {
            saved.imap = [];
          }
          saved.imap.push(obj);
          config.set("ebay-cli", saved);
          log("🟢 IMAP Provider added!", "success");
          await restartApp(2500);

          // View saved IMAP Providers
        } else if (imapRes.action === "[2] View saved IMAP Providers") {
          let saved = await config.get("ebay-cli");
          if (!saved.imap || saved.imap.length === 0) {
            log("❌ No IMAP Providers saved!", "error");
          } else {
            log(`🟢 IMAP Providers (${saved.imap.length}):`, "success");
            console.table(saved.imap, ["provider", "email", "password"]);

            await promptPressToContinue();
          }
          await restartApp();

          // Clear All Providers
        } else if (imapRes.action === "[3] Clear All Providers") {
          let saved = await config.get("ebay-cli");
          if (saved.imap) {
            saved.imap = [];
            config.set("ebay-cli", saved);
            log("🟢 IMAP Providers cleared!", "success");
          } else {
            log("❌ No IMAP Providers saved!", "error");
          }
          await restartApp(2500);
        } else if (imapRes.action === "[4] Go Back") {
          await restartApp();
        }
      } catch (error) {
        throw new AppError(
          `Error with IMAP Manager: ${error.message}`,
          "E_SETTINGS"
        );
      }
    } else if (response.action === "[3] SMS") {
      try {
        let smsRes = await inquirer.prompt([
          {
            type: "list",
            name: "action",
            message: "SMS Settings:",
            choices: [
              "[1] Add SMS Provider",
              "[2] View SMS Providers",
              "[3] Clear All Providers",
              new inquirer.Separator(),
              "[4] Go Back",
            ],
          },
        ]);
        if (smsRes.action === "[1] Add SMS Provider") {
          let addNewSmsRes = await inquirer.prompt([
            {
              type: "list",
              name: "action",
              message: "Select SMS provider to add:",
              choices: ["5sim.net", "SMS-Activate", "TextVerified"],
            },
            {
              type: "input",
              name: "apiKey",
              message: "Paste API Key:",
            },
            {
              type: "input",
              name: "apiUserName",
              message: "Paste API Username:",
              when: (answers) => answers.action === "TextVerified",
            },
          ]);

          let saved = await config.get("ebay-cli");
          if (!saved.sms) {
            saved.sms = {
              fivesim: { key: "", balance: 0 },
              smsactivate: { key: "", balance: 0 },
              textverified: {
                key: "",
                apiUserName: "",
                bearerToken: "",
                expiresAt: "",
                balance: 0,
              },
            };
          }

          if (addNewSmsRes.action === "5sim.net") {
            saved.sms.fivesim.key = addNewSmsRes.apiKey;
          } else if (addNewSmsRes.action === "SMS-Activate") {
            saved.sms.smsactivate.key = addNewSmsRes.apiKey;
          } else if (addNewSmsRes.action === "TextVerified") {
            saved.sms.textverified.key = addNewSmsRes.apiKey;
            saved.sms.textverified.apiUserName = addNewSmsRes.apiUserName;
            saved.sms.textverified.bearerToken = "";
            saved.sms.textverified.expiresAt = "";
          }

          config.set("ebay-cli", saved);
          log("🟢 SMS Provider updated!", "success");
          await restartApp(2500);
        } else if (smsRes.action === "[2] View SMS Providers") {
          let saved = await config.get("ebay-cli");
          if (!saved.sms) {
            log("❌ No SMS Providers saved!", "error");
          }

          // Create & Start loading spinner
          const spinner = createSpinner(`Fetching Providers...`);

          // Create table
          let tableData = Object.entries(saved.sms).map(
            ([name, { key, balance = 0 }]) => ({
              Name: name,
              FullKey: key, // Store the full key
              ShortenedKey: shortenApiKey(key), // Store the shortened key for display
              Balance: balance,
            })
          );
          // Update tableData with the latest balance for each provider directly
          await Promise.all(
            tableData.map(async (provider) => {
              provider.Balance = await checkBalance(
                provider.Name,
                provider.FullKey
              );
            })
          );

          // Display table with shortened keys
          let displayData = tableData.map(
            ({ Name, ShortenedKey, Balance }) => ({
              Name,
              Key: ShortenedKey,
              Balance,
            })
          );

          // Stop spinner
          spinner.stop();

          // Display table
          log("🟢 SMS Providers:", "success");
          console.table(displayData);

          // Prompt user to press any key to continue when done looking at providers
          await promptPressToContinue();

          global.runMain();
          return;
        } else if (smsRes.action === "[3] Clear All Providers") {
          let saved = await config.get("ebay-cli");
          global.logThis("🟢 SMS Providers cleared!", "success");
          if (saved.sms) {
            saved.sms = {
              fivesim: { key: "", balance: "" },
              smsactivate: { key: "", balance: "" },
              textverified: {
                key: "",
                apiUserName: "",
                bearerToken: "",
                expiresAt: "",
                balance: "",
              },
            };
            config.set("ebay-cli", saved);
          }

          await restartApp(2500);
        } else if (smsRes.action === "[4] Go Back") {
          await restartApp();
        }
      } catch (error) {
        throw new AppError(
          `Error in SMS Manager: ${error.message}`,
          "E_SETTINGS"
        );
      }
    } else if (response.action === "[4] Webhooks") {
      try {
        log("🕒 Opening Webhook Manager...", "info");
        await handleWebhookManager();
      } catch (error) {
        throw new AppError(
          `Error in Webhook Manager: ${error.message}`,
          "E_SETTINGS"
        );
      }
    } else if (response.action === "[5] Go Back") {
      await restartApp();
    }
  } catch (error) {
    throw new AppError(`${error.message}`, "E_SETTINGS");
  }
};
