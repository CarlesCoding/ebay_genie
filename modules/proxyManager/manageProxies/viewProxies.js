import { getFile } from "../proxy.js";

// ? IDEA: Change proxy obj for better viewing experience
// {
//   "ip": "127.0.0.1",
//   "port": "8080",
//   "username": "username",
//   "password": "password"
//   "status:" "alive" or "dead",
//   "latency": 123,
//   "last checked": 4/20/24
// }

export const handleViewProxies = async () => {
  try {
    // Get Proxy File
    const proxyFile = await getFile("proxies");

    // console.log("");
    global.logThis(
      `\n[PROXY TESTER] - You have [${proxyFile.length}] saved proxies.`,
      "info"
    );

    // Display Proxies
    displayProxies(proxyFile);
  } catch (error) {
    global.logThis(`Error viewing proxies: ${error}`, "error");
  }
};

// if user || Pass is longer then 12 characters, shorten it to display it in table correctly
const shortenString = (str, maxLength = 12) => {
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
};

// Function to process and display proxies
const displayProxies = async (proxies) => {
  const formattedProxies = proxies.map(({ proxy, latency }) => {
    const parts = proxy.trim().split(":");
    let [ip, port] = parts;
    let username = "N/A";
    let password = "N/A";

    if (parts.length === 4) {
      [ip, port, username, password] = parts;
      username = shortenString(username);
      password = shortenString(password);
    }

    return { ip, port, username, password, "Latency (ms)": latency };
  });

  // Display the proxies
  console.table(formattedProxies);

  await global.sleep(10000);
  console.clear();
  global.runMain();
  return;
  return;
};
