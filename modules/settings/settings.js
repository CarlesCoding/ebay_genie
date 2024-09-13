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
} from "../../helpers.js";

// TODO: captchas need saved like sms providers (sharing balance along with key)

export const handleEditSettings = async () => {
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

  if (response.action === "[5] Go Back") {
    global.runMain();
    return;
  } else if (response.action === "[4] Webhooks") {
    global.logThis("🕒 Opening Webhook Manager...", "info");
    // TODO: Webhook
    notDevelopedYet();
    // await handleWebhookManager();
  } else if (response.action === "[3] SMS") {
    let smsRes = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "SMS Settings:",
        choices: [
          "Add SMS Provider",
          "View SMS Providers",
          "Clear All Providers",
          new inquirer.Separator(),
          "Go Back",
        ],
      },
    ]);
    if (smsRes.action === "Add SMS Provider") {
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
      } else {
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
      }

      config.set("ebay-cli", saved);
      global.logThis("🟢 SMS Provider updated!", "success");
      await sleep(2500);
      global.runMain();
      return;
    } else if (smsRes.action === "View SMS Providers") {
      let saved = await config.get("ebay-cli");
      if (!saved.sms) {
        global.logThis("❌ No SMS Providers saved!", "error");
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
      let displayData = tableData.map(({ Name, ShortenedKey, Balance }) => ({
        Name,
        Key: ShortenedKey,
        Balance,
      }));

      // Stop spinner
      spinner.stop();

      // Display table
      global.logThis("🟢 SMS Providers:", "success");
      console.table(displayData);

      // Prompt user to press any key to continue when done looking at providers
      await promptPressToContinue();

      global.runMain();
      return;
    } else if (smsRes.action === "Clear All Providers") {
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

      await sleep(2500);
      global.runMain();
      return;
    } else if (smsRes.action === "Go Back") {
      global.runMain();
      return;
    }
  } else if (response.action === "[1] Captcha") {
    let captchaRes = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Captcha Manager:",
        choices: [
          "Add Captcha Provider",
          "View saved Captcha Providers",
          "Clear All Providers",
          new inquirer.Separator(),
          "Go Back",
        ],
      },
    ]);
    if (captchaRes.action === "Add Captcha Provider") {
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
          twocaptcha: "",
          capmonster: "",
          capsolver: "",
        };
      }

      if (captchaRes2.provider === "2captcha") {
        saved.captcha.twocaptcha = captchaRes2.apiKey;
      } else if (captchaRes2.provider === "CapMonster") {
        saved.captcha.capmonster = captchaRes2.apiKey;
      } else if (captchaRes2.provider === "CapSolver") {
        saved.captcha.capsolver = captchaRes2.apiKey;
      }

      await config.set("ebay-cli", saved);
      global.logThis("🟢 Captcha Provider updated!", "success");
      await sleep(2500);
      global.runMain();
      return;
    } else if (captchaRes.action === "View saved Captcha Providers") {
      let saved = await config.get("ebay-cli");
      if (!saved.captcha) {
        global.logThis("❌ No Captcha Providers saved!", "error");
      } else {
        global.logThis("🟢 Captcha Providers:", "success");
        global.logThis("2captcha: " + saved.captcha.twocaptcha, "info");
        global.logThis("CapMonster: " + saved.captcha.capmonster, "info");
        global.logThis("CapSolver: " + saved.captcha.capsolver, "info");
      }

      await sleep(5000);
      global.runMain();
      return;
    } else if (captchaRes.action === "Clear All Providers") {
      let saved = await config.get("ebay-cli");
      if (saved.captcha) {
        saved.captcha = {
          twocaptcha: "",
          capmonster: "",
          capsolver: "",
        };
        config.set("ebay-cli", saved);
        global.logThis("🟢 Captcha Providers cleared!", "success");
      } else {
        global.logThis("❌ No Captcha Providers saved!", "error");
      }

      await sleep(2500);
      global.runMain();
      return;
    } else if (captchaRes.action === "Go Back") {
      global.runMain();
      return;
    }
  } else if (response.action === "[2] IMAP") {
    let imapRes = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "IMAP Manager:",
        choices: [
          "Add IMAP Provider",
          "View saved IMAP Providers",
          "Clear All Providers",
          new inquirer.Separator(),
          "Go Back",
        ],
      },
    ]);

    // Add IMAP Provider
    if (imapRes.action === "Add IMAP Provider") {
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
      global.logThis("🟢 IMAP Provider added!", "success");
      await sleep(2500);
      global.runMain();
      return;

      // View saved IMAP Providers
    } else if (imapRes.action === "View saved IMAP Providers") {
      let saved = await config.get("ebay-cli");
      if (!saved.imap || saved.imap.length === 0) {
        global.logThis("❌ No IMAP Providers saved!", "error");
      } else {
        global.logThis(`🟢 IMAP Providers (${saved.imap.length}):`, "success");
        console.table(saved.imap, ["provider", "email", "password"]);
      }
      await sleep(5000);
      global.runMain();
      return;

      // Clear All Providers
    } else if (imapRes.action === "Clear All Providers") {
      let saved = await config.get("ebay-cli");
      if (saved.imap) {
        saved.imap = [];
        config.set("ebay-cli", saved);
        global.logThis("🟢 IMAP Providers cleared!", "success");
      } else {
        global.logThis("❌ No IMAP Providers saved!", "error");
      }
      await sleep(2500);
      global.runMain();
      return;
      // Go Back
    } else if (imapRes.action === "Go Back") {
      global.runMain();
      return;
    }
  }
};
