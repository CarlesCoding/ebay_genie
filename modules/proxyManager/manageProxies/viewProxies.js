import { getProxyFile } from "../proxy.js";

// ? IDEA: Make the proxy file a JSON file.. for better viewing experience
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
    const proxyFile = await getProxyFile();

    // Split the file content by lines
    const proxies = proxyFile.split("\n").map((line) => {
      // Split each line by colon (':')
      let [ip, port, username, password] = line.trim().split(":");

      username = shortenString(username);
      password = shortenString(password);

      // Create an object for each proxy
      return { ip, port, username, password };
    });

    global.logThis(
      `[PROXY TESTER] - [${proxies.length} Valid Proxies]:`,
      "info"
    );

    // Display the proxies
    console.table(proxies);
  } catch (error) {
    global.logThis(`Error getting proxies from file: ${error}`, "error");
  }
};

// if user || Pass is longer then 12 characters, shorten it to display it in table correctly
const shortenString = (string) => {
  if (string.length > 12) {
    return string.slice(0, 12) + "...";
  } else {
    return string;
  }
};
