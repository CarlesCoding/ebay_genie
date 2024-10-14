import AppError from "../../utilities/errorHandling/appError.js";
import { get2CaptchaBalance } from "./providers/2cap.js";
import { getCapMonsterBalance } from "./providers/capMonster.js";
import { getCapSolverBalance } from "./providers/capSolver.js";

export const checkCaptchaBalances = async (name, key) => {
  try {
    let balance;

    if (name === "twocaptcha") {
      const newBalance = await get2CaptchaBalance(key);
      balance = newBalance;
    } else if (name === "capmonster") {
      const newBalance = await getCapMonsterBalance(key);
      balance = newBalance;
    } else if (name === "capsolver") {
      const newBalance = await getCapSolverBalance(key);
      balance = newBalance;
    }

    return balance;
  } catch (error) {
    throw new AppError(
      `Error checking ${name} balance: ${error.message}`,
      "E_CAPTCHA"
    );
  }
};
