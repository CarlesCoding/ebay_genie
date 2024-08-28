// ------------------- 5-Sim --------------------
// Get Balance
export const getFiveSimBalance = async (key) => {
  const endpoint = `https://5sim.net/v1/user/profile`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: "Bearer " + key,
        Accept: "application/json",
      },
    });

    const data = await response.json();
    const balance = data.balance;

    return balance;
  } catch (error) {
    throw new Error(`Error in getFiveSimBalance: ${error.message}`);
  }
};

// Get Cheapest Operator
export const getCheapestService = async (region = "usa") => {
  try {
    const url = `https://5sim.net/v1/guest/prices?country=${region}&product=ebay`;

    const response = await fetch(url);

    const json = await response.json();

    const data = json[region]["ebay"];

    // Step 1: Convert the object to an array of entries
    const entries = Object.entries(data);

    // Step 2: Filter entries with count > 1
    const filteredEntries = entries.filter(([, value]) => value.count > 1);

    // Step 3: Sort the filtered entries by cost
    const sortedFilteredEntries = filteredEntries.sort(
      ([, a], [, b]) => a.cost - b.cost
    );

    // Step 4: Convert sorted filtered entries to an array of objects with names
    const sortedFilteredArray = sortedFilteredEntries.map(([key, value]) => ({
      name: key,
      ...value,
    }));
    // Return example:
    // [{ name: "virtual40", cost: 11.5, count: 16192, rate: 0 }];
    const cheapestServiceOperator = sortedFilteredArray[0].name;
    console.log(`cheapestServiceOperator = `, cheapestServiceOperator);

    return cheapestServiceOperator;
  } catch (error) {
    throw new Error(`Error in getCheapestService: ${error.message}`);
  }
};

// Get Phone Number
export const getFiveSimPhoneNumber = async (key) => {
  const fivesimApiKey = config.get("ebay-cli.sms.fivesim");
  let token = fivesimApiKey.key;
  const country = "usa"; // Default to USA
  const operator = await getCheapestService();

  const endpoint = `https://5sim.net/v1/user/buy/activation/${country}/${operator}/ebay`;
  const headers = {
    Authorization: "Bearer " + token,
    Accept: "application/json",
  };

  try {
    const response = await fetch(endpoint, {
      headers,
      responseType: "json",
    });

    const data = await response.json();
    // EXAMPLE RES:
    // {
    //   id: 598690000,
    //   phone: '+19089215959',
    //   operator: 'virtual40',
    //   product: 'ebay',
    //   price: 11.5,
    //   status: 'RECEIVED',
    //   expires: '2024-05-14T00:50:20.94818456Z',
    //   sms: null,
    //   created_at: '2024-05-14T00:30:20.94818456Z',
    //   country: 'usa'
    // }

    return data;
  } catch (error) {
    throw new Error(`Error in getFiveSimPhoneNumber: ${error.message}`);
  }
};

// Cancel Phone Number
export const cancelFiveSimPhoneNumber = async (id) => {
  const fivesimApiKey = config.get("ebay-cli.sms.fivesim");
  let token = fivesimApiKey.key;
  const url = `https://5sim.net/v1/user/cancel/${id}`;
  const headers = {
    Authorization: "Bearer " + token,
    Accept: "application/json",
  };

  try {
    const response = await fetch(url, {
      headers,
      responseType: "json",
    });

    const data = await response.json();
    // EXAMPLE RES:
    // {
    //   id: 598690000,
    //   phone: '+19089215959',
    //   operator: 'virtual40',
    //   product: 'ebay',
    //   price: 11.5,
    //   status: 'CANCELED',
    //   expires: '2024-05-14T00:50:20.948185Z',
    //   sms: [],
    //   created_at: '2024-05-14T00:30:20.948185Z',
    //   country: 'usa'
    // }

    return data;
  } catch (error) {}
};

// Finish Successful Phone Number
export const finishFiveSimPhoneNumber = async (id) => {
  const fivesimApiKey = config.get("ebay-cli.sms.fivesim");
  let token = fivesimApiKey.key;
  const url = `https://5sim.net/v1/user/finish/${id}`;
  const headers = {
    Authorization: "Bearer " + token,
    Accept: "application/json",
  };

  try {
    const response = await fetch(url, headers);

    const data = response.json();

    return data;
  } catch (error) {}
};

// Check Phone Number Status
export const checkFiveSimPhoneNumberStatus = async (id) => {
  const fivesimApiKey = config.get("ebay-cli.sms.fivesim");
  let token = fivesimApiKey.key;
  const url = `https://5sim.net/v1/user/check/${id}`;
  const headers = {
    Authorization: "Bearer " + token,
    Accept: "application/json",
  };

  try {
    const response = await fetch(url, headers);

    const data = response.json();

    return data;
  } catch (error) {}
};
