import { getFiveSimPhoneNumber } from "./providers/fiveSim.js";
import { getPhoneNumber } from "./providers/sms-activate.js";
import { getTextVerifiedNumberFlow } from "./providers/textVerified.js";

export const handleGetPhoneNumber = async (simProvider) => {
  const providerMap = {
    "sms-activate": getPhoneNumber,
    fivesim: getFiveSimPhoneNumber,
    textverified: getTextVerifiedNumberFlow,
  };

  const provider = providerMap[simProvider];

  if (!provider) {
    throw new Error(`Invalid SIM provider: ${simProvider}`);
  }

  try {
    const phone = await provider();
    const phoneData = {
      provider: simProvider,
      id: phone.id,
      phone: phone.phone,
    };

    return phoneData;
  } catch (error) {
    throw error;
  }
};

export const getPhone = async (task) => {
  const phoneData = await handleGetPhoneNumber(task.simProvider);

  // Check if phone number exists
  if (!phoneData) throw new Error("Failed to get phone number");

  return phoneData;
};
