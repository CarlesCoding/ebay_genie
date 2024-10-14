import AppError from "../../utilities/errorHandling/appError.js";
import { getTextVerifiedBalance } from "./providers/textVerified.js";

// ------------------- Check All Providers Balance --------------------
export const checkBalance = async (name, key) => {
  try {
    let balance;

    // Check Balance endpoints for each provider
    const balanceEndpoints = {
      fivesim: `https://5sim.net/v1/user/profile`,
      smsactivate: `https://api.sms-activate.org/stubs/handler_api.php?api_key=${key}&action=getBalance`,
    };

    let endpoint = balanceEndpoints[name];

    // Set textverified endpoint to 1, just to get around not having an endpoint for textVerified
    if (name === "textverified") endpoint = 1;

    if (!endpoint) return;

    if (name === "fivesim") {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: "Bearer " + key,
          Accept: "application/json",
        },
      });

      balance = await response.text();
    } else if (name === "smsactivate") {
      const response = await fetch(endpoint);
      const data = await response.text();
      const newBalance = data.split(":")[1];
      balance = parseFloat(newBalance);
    } else if (name === "textverified") {
      const response = await getTextVerifiedBalance();
      balance = await response;
    }

    return balance;
  } catch (error) {
    throw new AppError(`Error checking SMS balance: ${error.message}`, "E_SMS");
  }
};

export const updateTableData = (tableData, name, balance) => {
  const index = tableData.findIndex((item) => item.Name === name);
  if (index !== -1) {
    tableData[index].Balance = balance !== "0" ? balance : 0;
  }
  // Save & Return
  return tableData;
};
