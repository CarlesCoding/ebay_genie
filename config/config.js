import Conf from "conf";
import envPaths from "env-paths";
import configSchema from "./configSchema.js";
import AppError from "../utilities/errorHandling/appError.js";

// Name of the project
const projectName = "ebay-cli";

// Get the path to config depending on OS
const paths = envPaths(projectName);

// Create the Conf instance
const config = new Conf({
  projectName: projectName,
  cwd: paths.config,
});

export const validateAndSaveConfig = (newConfig = {}) => {
  // Validate the incoming config with Joi
  const { error, value: validatedConfig } = configSchema.validate(newConfig, {
    abortEarly: false,
  });

  if (error) {
    throw new AppError(
      `Configuration validation failed: ${error.details
        .map((e) => e.message)
        .join(", ")}`,
      `E_CONFIG`
    );
  }

  // Save validated config to `conf`
  config.set("ebay-cli", validatedConfig);
  return validatedConfig;
};

export default config;
