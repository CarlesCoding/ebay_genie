import AppError from "../../../utilities/errorHandling/appError.js";

export const get2CaptchaBalance = async (apiKey) => {
  const url = `https://2captcha.com/res.php?key=${apiKey}&action=getbalance`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const balance = Number(parseFloat(data).toFixed(2));
    return balance;
  } catch (error) {
    throw new AppError(
      `Failed to get 2Captcha balance: ${error.message}`,
      "E_CAPTCHA"
    );
  }
};
