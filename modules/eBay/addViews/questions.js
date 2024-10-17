import config from "../../../config/config.js";

const MAX_VIEWS = config.get("MAX_VIEWS");

export const questions = [
  {
    type: "input",
    name: "viewCount",
    message: "How many views would you like to send?",
    validate: (input) => {
      // Check if input is not empty
      if (!input) return "Please enter a number of views to add.";

      // Check it is a valid number
      if (isNaN(parseInt(input))) return "Please enter a valid number.";

      // Check its a positive number A && not bigger then MAX number in config.js
      if (parseInt(input) > MAX_VIEWS || parseInt(input) <= 0)
        return `Please enter a number less than or equal to ${MAX_VIEWS}.`;

      // Return true if valid
      return true;
    },
  },
  {
    type: "input",
    name: "ebayUrl",
    message: "Enter the url of the ebay listing",
    validate(url) {
      //   Check if input is not empty
      if (!url) return "Please enter a url.";

      //   Check is valid url
      if (!url.includes("https://www.ebay.com/"))
        return "Please Enter a valid eBay Link";

      // Return true if valid
      return true;
    },
  },
  {
    type: "confirm",
    name: "useProxies",
    message: "Use proxies? (Residential proxies recommended)",
  },
  {
    type: "list",
    name: "webhook",
    message: "Which webhook would you like to use?",
    choices: savedWebhooks.map((x) => x.label),
  },
];
