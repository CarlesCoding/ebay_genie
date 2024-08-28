import config from "../../../config/config.js";

// ------------------- SMS-Activate --------------------

// const smsActivateApiKey = config.get("ebay-cli.sms.smsactivate");
// const getSmsActivateBaseUrl() = `https://api.sms-activate.org/stubs/handler_api.php?api_key=${smsActivateApiKey.key}`;

const getSmsActivateApiKey = () => {
  const smsActivateApiKey = config.get("ebay-cli.sms.smsactivate");
  return smsActivateApiKey.key;
};

const getSmsActivateBaseUrl = () => {
  const apiKey = getSmsActivateApiKey();
  return `https://api.sms-activate.org/stubs/handler_api.php?api_key=${apiKey}`;
};

// Get Balance
export const getSmsActivateBalance = async (code) => {
  try {
    // const url = `${BASE_URL}&action=getBalance`;

    const response = await fetch(
      `${getSmsActivateBaseUrl()}&action=getBalance`
    );

    const data = await response.text();
    const balance = parseFloat(data.split(":")[1]);

    return balance;
  } catch (error) {
    console.log(error);
  }
};

// Get Phone Number
export const getPhoneNumber = async (code) => {
  const service = "dh"; // ebay code
  const country = 187; // 12 = usa (virtual: low success rate); 187 = usa
  const endpoint = `${getSmsActivateBaseUrl()}&action=getNumber&service=${service}&country=${country}`;

  try {
    const response = await fetch(endpoint);

    const data = await response.text();
    // RESPONSE: ACCESS_NUMBER:2415957989:14054023823 (ACCESS_NUMBER:id:phoneNumber)

    if (data === "NO_BALANCE") {
      // throw new Error(`Sms-activate balance is too low. Exiting...`);
      return global.logThis(
        `Sms-activate balance is too low. Exiting...`,
        "error"
      );
    }

    const id = data.split(":")[1];
    const phone = data.split(":")[2];
    const phoneInfo = { id, phone };

    return phoneInfo;
  } catch (error) {
    throw new Error(`Error in getPhoneNumber: ${error.message}`);
  }
};

// Check Phone Number Status
export const checkPhoneNumberStatus = async (id) => {
  console.log("Checking phone number status...");
  const endpoint = `${getSmsActivateBaseUrl()}&action=getStatus&id=${id}`;

  try {
    const response = await fetch(endpoint);

    const data = await response.text();

    // ANSWER OPTIONS:
    const possibleAnswer = [
      "STATUS_WAIT_CODE", // waiting for SMS
      "STATUS_WAIT_RETRY", // past, unmatched code' - waiting for code clarification
      "STATUS_WAIT_RESEND", // waiting for re-sending SMS *
      "STATUS_CANCEL", // activation canceled
      "STATUS_OK", // 'activation code' - code received
    ];

    // console.log("Phone reply = ", data);

    return data;
  } catch (error) {
    throw new Error(`Error in checkPhoneNumberStatus: ${error.message}`);
  }
};

// Cancel Phone Number
export const cancelPhoneNumber = async (id) => {
  const status = 8; // Cancel Number

  const endpoint = `${getSmsActivateBaseUrl()}&action=setStatus&status=${status}&id=${id}`;

  try {
    const response = await fetch(endpoint);
    const data = await response.text();

    // TODO: If the number fails.. find a way to cancel it after 2 mins. But, keep the application flowing

    // TODO: This needs to loop till success, or else it wont try again if its < 2 min
    // ----- POSSIBLE ANSWER -----
    const possibleAnswer = [
      "ACCESS_READY", // numbers readiness confirmed
      "ACCESS_RETRY_GET", // waiting for a new SMS
      "ACCESS_ACTIVATION", // the service has been successfully activated
      "ACCESS_CANCEL", // activation canceled
    ];

    // ----- POSSIBLE MISTAKES -----
    const possibleMisakes = [
      "EARLY_CANCEL_DENIED", // You can‘t cancel the number within the first 2 minutes
      "ERROR_SQL", // sql-server error
      "NO_ACTIVATION", // activation id does not exist
      "BAD_SERVICE", // incorrect service name
      "BAD_STATUS", // incorrect status
      "BAD_KEY", // invalid API key
      "BAD_ACTION", // incorrect action
    ];

    return data;
  } catch (error) {
    throw new Error(`Error in cancelPhoneNumber: ${error.message}`);
  }
};

// Finish Successful Phone Number
export const finishPhoneNumber = async (id) => {
  // TODO: On successful activation, finish the number (call this function after submitting the code, to clear it)
  const status = 6; // Confirm SMS code and complete activation

  const endpoint = `${getSmsActivateBaseUrl()}&action=setStatus&status=${status}&id=${id}`;

  try {
    const response = await fetch(endpoint);
    const data = await response.text();

    // TODO: If the number fails.. find a way to cancel it after 2 mins. But, keep the application flowing
    // ----- POSSIBLE ANSWER -----
    // ACCESS_READY - numbers readiness confirmed
    // ACCESS_RETRY_GET - waiting for a new SMS
    // ACCESS_ACTIVATION - the service has been successfully activated
    // ACCESS_CANCEL - activation canceled
    // ----- POSSIBLE MISTAKES -----
    // EARLY_CANCEL_DENIED - You can‘t cancel the number within the first 2 minutes
    // ERROR_SQL - sql-server error
    // NO_ACTIVATION - activation id does not exist
    // BAD_SERVICE - incorrect service name
    // BAD_STATUS - incorrect status
    // BAD_KEY - invalid API key
    // BAD_ACTION - incorrect action

    return data;
  } catch (error) {
    throw new Error(`Error in cancelPhoneNumber: ${error.message}`);
  }
};

// Get Active Activations
export const getActiveActivations = async (arrayIfIds) => {
  // Request active activations
  const endpoint = `${getSmsActivateBaseUrl()}&action=getActiveActivations`;

  try {
    const response = await fetch(endpoint);

    const data = await response.json();

    return data;
  } catch (error) {
    throw new Error(`Error in cleanUpFailedCodes: ${error.message}`);
  }
};

// Temp: Clean up failed codes.. after 2 mins
export const cleanUpFailedCodes = async () => {
  try {
    const checkActiveActivations = await getActiveActivations();

    if (
      checkActiveActivations.status === "error" &&
      checkActiveActivations.error === "NO_ACTIVATIONS"
    ) {
      console.log(`No active activations`);
      return;
    }

    const activeActivations = checkActiveActivations.activeActivations;
    const listOfIds = activeActivations.map(({ activationId }) => activationId);

    await Promise.all(listOfIds.map(cancelPhoneNumber));
  } catch (error) {
    throw new Error(`Error in cleanUpFailedCodes: ${error.message}`);
  }
};

// console.log(await getPhoneNumber());
// console.log(await checkPhoneNumberStatus(id));
// console.log(await cancelPhoneNumber("2418898220"));
// console.log(await cleanUpFailedCodes());
