import Conf from "conf";
import envPaths from "env-paths";

// Default storage configuration
export const defaultConfig = {
  licenseKey: "",
  tasks: [],
  webhooks: [],
  sessions: [],
  profiles: [],
  imap: [],
  proxies: [],
  sms: {
    fivesim: { key: "", balance: 0 },
    smsactivate: { key: "", balance: 0 },
    textverified: {
      key: "",
      apiUserName: "",
      bearerToken: "",
      expiresAt: "",
      balance: 0,
    },
  },
  captcha: {
    twocaptcha: "",
    capmonster: "",
    capsolver: "",
  },
  MAX_VIEWS: 50,
  MAX_CONCURRENT_TASKS: 3,
  CONNECTION_TIMEOUT_LIMIT: 5000,
};

// ? Adding the 3 settings at the end of the config could break if not reset

// Name of the project
const projectName = "ebay-cli";

// Get the path to config depending on OS
const paths = envPaths(projectName);

// Create the config
const config = new Conf({
  projectName: projectName,
  cwd: paths.config,
  defaults: defaultConfig,
});

export default config;
