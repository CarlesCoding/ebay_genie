import config from "../../../config/config.js";
import { getAllSavedAccounts } from "../../../helpers.js";
import { urls } from "../../../utilities/urls.js";

let savedWebhooks = config.get("ebay-cli.webhooks");

export const questions = [
  {
    type: "input",
    name: "watcherCount",
    message: "How many watchers would you like to add to listing?",
    validate: async (value) => {
      if (isNaN(value)) {
        return "Please enter a number.";
      }

      const accounts = await getAllSavedAccounts();

      if (value < 1 || value > accounts.length) {
        return `Please enter a number between 1 and ${accounts.length} Or generate more accounts.`;
      }

      return true;
    },
  },
  {
    type: "input",
    name: "url",
    message: "Enter the url of the listing",
    validate: (value) => {
      if (!value) {
        return "Please enter a url.";
      }

      if (!value.startsWith(urls.ebayUrls.validItemUrl)) {
        return "Please enter a valid eBay url.";
      }

      return true;
    },
  },
  {
    type: "confirm",
    name: "useProxies",
    message: "Would you like to use proxies?",
  },
  {
    type: "list",
    name: "webhook",
    message: "Which webhook would you like to use?",
    choices: savedWebhooks.map((x) => x.label),
  },
];
