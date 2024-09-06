import { log } from "../helpers.js";

export const notDevelopedYet = async () => {
  log("Sorry, this feature is not developed yet!", "error");
  await global.sleep(2500);
  global.runMain();
  return;
};
