import config from "../../../config/config.js";

//  --- Text Verified Flow ---
// 1. Get Bearer Token
// 2. getTextVerifiedPhoneNumber()
// 3. checkTextVerifiedPhoneNumberStatus() to get number and state
// 4. loop checkTextVerifiedPhoneNumberStatus() till state changes from 'verificationPending' to 'verificationCompleted'
// 5. getTextVerifiedSMSCode() to get code
// ----------------------------

const API_SERVER = "https://www.textverified.com";

let tokenData = {
  token: null,
  expiresAt: null,
};

// Initialize token data from the saved configuration
export const initializeTokenData = async () => {
  const saved = await config.get("ebay-cli");

  if (!saved?.sms?.textverified?.bearerToken) {
    return;
  }

  tokenData.token = saved.sms.textverified.bearerToken;
  tokenData.expiresAt = saved.sms.textverified.expiresAt;
};

// Check if the bearer token is expired
const isTokenExpired = (expiresAt) => {
  return new Date() >= new Date(expiresAt);
};

// Fetch and save a new token
const fetchNewToken = async () => {
  const saved = await config.get("ebay-cli");
  const API_KEY = saved.sms.textverified.key;
  const API_USERNAME = saved.sms.textverified.apiUserName;

  const headers = {
    "X-API-USERNAME": API_USERNAME,
    "X-API-KEY": API_KEY,
  };

  try {
    const response = await fetch(`${API_SERVER}/api/pub/v2/auth`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.statusText}`);
    }

    const data = await response.json();

    // Set token data
    tokenData.token = data.token;
    tokenData.expiresAt = new Date(data.expiresAt).toISOString();

    // Save the new token and expiration time into the configuration
    saved.sms.textverified.bearerToken = tokenData.token;
    saved.sms.textverified.expiresAt = tokenData.expiresAt;

    // Save the updated configuration
    config.set("ebay-cli", saved);

    // Return the token
    return tokenData.token;
  } catch (error) {
    throw new Error(`Error in fetchNewToken: ${error.message}`);
  }
};

// Get or refresh token as needed
const getToken = async () => {
  if (!tokenData.token || isTokenExpired(tokenData.expiresAt)) {
    return await fetchNewToken();
  }

  // If token is still valid, return it
  return tokenData.token;
};

// Generic function to make authenticated API request
const textVerifiedApiRequest = async (url, options = {}) => {
  const token = await getToken();

  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Refresh token and retry
    await fetchNewToken();
    return await textVerifiedApiRequest(url, options);
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errorDescription || response.statusText);
  }

  // Phone number needs the location from the res.headers
  // If the URL is for verifications, return the response directly to get the location header
  if (url === "https://www.textverified.com/api/pub/v2/verifications") {
    const location = response.headers.get("location");
    return location;
  }

  if (url.includes("cancel")) {
    if (response.status === 200) {
      return "Cancelled Number successfully";
    }
  }

  const data = await response.json();
  return data;
};

// Get Balance
export const getTextVerifiedBalance = async () => {
  const url = `${API_SERVER}/api/pub/v2/account/me`;
  const data = await textVerifiedApiRequest(url);
  return data.currentBalance;
};

// Get Phone Number (returns an ID to then check status with)
export const getTextVerifiedPhoneNumber = async () => {
  const url = `${API_SERVER}/api/pub/v2/verifications`;
  const body = JSON.stringify({
    serviceName: "ebay",
    capability: "sms",
  });

  const response = await textVerifiedApiRequest(url, {
    method: "POST",
    body,
  });

  if (!response) {
    throw new Error("Location header is missing in the response");
  }

  const reservationID = response.split("/").pop();
  return reservationID;
};

// Check Phone Number Status
export const checkTextVerifiedPhoneNumberStatus = async (verificationID) => {
  const url = `${API_SERVER}/api/pub/v2/verifications/${verificationID}`;
  const data = await textVerifiedApiRequest(url);
  const { state, number, id } = data;
  return { state, number, id };
};

// Get SMS Code
export const getTextVerifiedSMSCode = async (number, id) => {
  const url = `${API_SERVER}/api/pub/v2/sms?to=${number}&reservationId=${id}&reservationType=verification`;
  const data = await textVerifiedApiRequest(url);
  const { parsedCode } = data.data[0];
  return parsedCode;
};

// Cancel Phone Number
export const cancelTextVerifiedPhoneNumber = async (id) => {
  const url = `${API_SERVER}/api/pub/v2/verifications/${id}/cancel`;
  await textVerifiedApiRequest(url, { method: "POST" });
};

// ----- Main Flow to get number -----
export const getTextVerifiedNumberFlow = async () => {
  try {
    const reservationId = await getTextVerifiedPhoneNumber();
    const data = await checkTextVerifiedPhoneNumberStatus(reservationId);
    return { id: data.id, phone: data.number };
  } catch (error) {
    throw new Error(`Error with Text Verified: ${error.message}`);
  }
};

// Initialize token data when the module is loaded
initializeTokenData();
