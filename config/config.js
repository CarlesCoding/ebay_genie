import Conf from "conf";
import envPaths from "env-paths";
import configSchema from "./configSchema.js";

// Name of the project
const projectName = "ebay-cli";

// Get the path to config depending on OS
const paths = envPaths(projectName);

// Create the Conf instance
const config = new Conf({
  projectName: projectName,
  cwd: paths.config,
});

export const validateAndSaveConfig = (newConfig) => {
  // Validate the incoming config with Joi
  const { error, value: validatedConfig } = configSchema.validate(newConfig, {
    abortEarly: false,
  });

  if (error) {
    throw new Error(
      `Configuration validation failed: ${error.details
        .map((e) => e.message)
        .join(", ")}`
    );
  }

  // Save validated config to `conf`
  config.set("ebay-cli", validatedConfig);
  return validatedConfig;
};

export default config;
