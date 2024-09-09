export const validateConfig = (config) => {
  let isValid = {};

  // Example validation: check if important keys exist and are of the correct type
  if (typeof config.licenseKey !== "string")
    return (isValid = {
      valid: false,
      errorMessage: `Invalid "licenseKey"`,
    });

  // Validate Numbers
  const configNumObt = [
    "MAX_VIEWS",
    "MAX_CONCURRENT_TASKS",
    "CONNECTION_TIMEOUT_LIMIT",
  ];

  for (const opt of configNumObt) {
    if (isNaN(opt))
      return (isValid = {
        valid: false,
        errorMessage: `Invalid "${opt}". It is not a number.`,
      });
  }

  // Validate Arrays
  const configArrayOpt = [
    "tasks",
    "webhooks",
    "sessions",
    "profiles",
    "imap",
    "proxies",
  ];

  for (const opt of configArrayOpt) {
    if (!config[opt] || !Array.isArray(config[opt])) {
      return (isValid = {
        valid: false,
        errorMessage: `Invalid "${opt}" section. It is not an array.`,
      });
    }
  }

  // Validate the 'sms' section if it exists
  if (config.sms) {
    if (typeof config.sms !== "object") {
      return (isValid = {
        valid: false,
        errorMessage: 'Invalid "sms" section',
      });
    }
    const smsProviders = ["fivesim", "smsactivate", "textverified"];
    for (const provider of smsProviders) {
      const providerConfig = config.sms[provider];
      if (providerConfig && typeof providerConfig === "object") {
        // Allow empty strings for 'key'
        if (typeof providerConfig.key !== "string") {
          return (isValid = {
            valid: false,
            errorMessage: `Invalid 'key' in provider: ${provider}`,
          });
        }
        if (typeof providerConfig.balance !== "number") {
          return (isValid = {
            valid: false,
            errorMessage: `Invalid 'balance' in provider: ${provider}`,
          });
        }
      }
    }
  }

  // Validate the 'captcha' section if it exists
  if (config.captcha) {
    if (typeof config.captcha !== "object") {
      return (isValid = {
        valid: false,
        errorMessage: 'Invalid "captcha" section',
      });
    }
    const captchaKeys = ["twocaptcha", "capmonster", "capsolver"];
    for (const key of captchaKeys) {
      const value = config.captcha[key];
      if (value !== undefined && typeof value !== "string") {
        return (isValid = {
          valid: false,
          errorMessage: `Invalid '${key}' in 'captcha' configuration`,
        });
      }
    }
  }

  return { valid: true };
};
