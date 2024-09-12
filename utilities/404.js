import { log, sleep } from "../helpers.js";

export const notDevelopedYet = async () => {
  log("Sorry, this feature is not developed yet!", "error");
  await sleep(2500);
  global.runMain();
  return;
};
