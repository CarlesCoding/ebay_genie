import Joi from "joi";

const proxySchema = Joi.object({
  proxy: Joi.string().allow("").required(),
  latency: Joi.number().required(),
});

const taskSchema = Joi.object({
  id: Joi.string().required(),
  module: Joi.string().required(),
  catchall: Joi.string().required(),
  imap: Joi.string().optional(),
  simProvider: Joi.string().required(),
  useProxies: Joi.boolean().required(),
  proxy: proxySchema.optional(),
});

const webhookSchema = Joi.object({
  label: Joi.string().required(),
  webhook: Joi.string().uri().required(),
});

const imapSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  provider: Joi.string().required(),
  id: Joi.string().required(),
});

const proxyArraySchema = Joi.array().items(proxySchema).default([]);
const taskArraySchema = Joi.array().items(taskSchema).default([]);
const webhookArraySchema = Joi.array().items(webhookSchema).default([]); // Fixed default to empty array
const imapArraySchema = Joi.array().items(imapSchema).default([]);

const configSchema = Joi.object({
  licenseKey: Joi.string().allow("").default(""), // Allow empty string
  tasks: taskArraySchema,
  webhooks: webhookArraySchema,
  // webhooks: Joi.array().items(webhookSchema).default([]), // Ensure this is always an array
  sessions: Joi.array().default([]),
  profiles: Joi.array().default([]),
  imap: imapArraySchema,
  proxies: proxyArraySchema,
  sms: Joi.object({
    fivesim: Joi.object({
      key: Joi.string().allow("").default(""), // Allow empty string
      balance: Joi.number().default(0), // Ensure balance is a number and defaults to 0
    }).default({}),
    smsactivate: Joi.object({
      key: Joi.string().allow("").default(""),
      balance: Joi.number().default(0),
    }).default({}),
    textverified: Joi.object({
      key: Joi.string().allow("").default(""),
      apiUserName: Joi.string().allow("").default(""),
      bearerToken: Joi.string().allow("").default(""),
      expiresAt: Joi.string().allow("").default(""),
      balance: Joi.number().default(0), // Ensure balance is a number and defaults to 0
    }).default({}),
  }).default({}),
  // captcha: Joi.object({
  //   twocaptcha: Joi.object({
  //     key: Joi.string().allow("").default(""), // Allow empty string
  //     balance: Joi.number().default(0), // Ensure balance is a number and defaults to 0
  //   }),
  //   capmonster: Joi.object({
  //     key: Joi.string().allow("").default(""), // Allow empty string
  //     balance: Joi.number().default(0), // Ensure balance is a number and defaults to 0
  //   }),
  //   capsolver: Joi.object({
  //     key: Joi.string().allow("").default(""), // Allow empty string
  //     balance: Joi.number().default(0), // Ensure balance is a number and defaults to 0
  //   }),
  // }).default({}),
  captcha: Joi.object({
    twocaptcha: Joi.string().allow("").default(""),
    capmonster: Joi.string().allow("").default(""), // Allow empty string
    capsolver: Joi.string().allow("").default(""), // Allow empty string
  }).default({}),

  MAX_VIEWS: Joi.number().default(50).min(1).max(100),
  MAX_CONCURRENT_TASKS: Joi.number().default(3).min(1),
  CONNECTION_TIMEOUT_LIMIT: Joi.number().default(5000).min(1),
});

export default configSchema;
