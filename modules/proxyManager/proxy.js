import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import path from "path";
import {
  checkFileExist,
  randomItemFromArray,
  readJsonFile,
} from "../../helpers.js";
import { axiosTestProxy } from "../../services/axios.js";
import { urls } from "../../utilities/urls.js";
import config from "../../config/config.js";

const timeout = config.get("CONNECTION_TIMEOUT_LIMIT");

/*
  Get proxy geolocation: https://reallyfreegeoip.org/json/66.63.167.226
*/

export const getFile = async (file) => {
  let contents;
  let filePath = path.join(process.cwd(), "assets", `${file}.json`);

  try {
    // Check if file exists
    let fileExist = await checkFileExist(filePath);
    if (!fileExist) {
      throw new Error("File does not exist or is empty.");
    } else {
      // Read file and get contents
      contents = await readJsonFile(filePath);
    }

    return contents[file];
  } catch (error) {
    throw new Error(`Failed to get ${file} file: ${error.message}`);
  }
};

export const parseProxyString = (proxy) => {
  const [ip, port, username, password] = proxy.split(":");
  if (username && password) {
    return `http://${username}:${password}@${ip}:${port}`.replace(
      /[\r\n]/g,
      ""
    );
  } else {
    return `http://${ip}:${port}`.replace(/[\r\n]/g, "");
  }
};

export const extractProxyInfo = (proxy) => {
  // Remove 'http://' prefix
  const proxyWithoutPrefix = proxy.replace("http://", "");
  const parts = proxyWithoutPrefix.split(":");

  // Check if credentials are present
  if (proxyWithoutPrefix.includes("@") || parts.length > 2) {
    // Split into components with credentials
    const [credentials, ipAndPort] = proxyWithoutPrefix.split("@");
    const [username, password] = credentials.split(":");
    const [ip, port] = ipAndPort.split(":");
    return { username, password, ip, port };
  } else {
    // No credentials, assume the entire string represents IP and port
    const [ip, port] = proxyWithoutPrefix.split(":");
    return { ip, port };
  }
};

export const fetchRandomProxy = async () => {
  let list = await getFile("proxies");
  let { proxy } = randomItemFromArray(list);
  let formatted = parseProxyString(proxy);
  return formatted;
};

export const fetchWithProxies = async (url, headers) => {
  try {
    // Get a random proxy
    const proxy = await fetchRandomProxy();

    // Create a new Proxy Agent
    const agent = new HttpsProxyAgent(proxy);

    const response = await fetch(url, {
      headers: headers,
      agent: agent,
      signal: AbortSignal.timeout(timeout),
    });

    return response;
  } catch (error) {
    throw new Error(`Error in fetchWithProxies: ${error.message}`);
  }
};

export const testProxiesConcurrently = async (proxiesToTest) => {
  const promises = proxiesToTest.map((proxy) =>
    testProxy(parseProxyString(proxy))
  );

  const results = await Promise.allSettled(promises);

  const validProxies = results
    .filter((result) => result.status === "fulfilled" && result.value.isValid)
    .map((result) => result.value.data);

  return validProxies;
};

export const testProxy = async (proxy, validProxies = []) => {
  const { ip, port } = extractProxyInfo(proxy);
  let proxyInfo = `${ip}:${port}`;

  try {
    const startTime = new Date();

    // Test the proxy
    const axiosInstance = await axiosTestProxy(proxy).get();

    const elapsedTime = new Date() - startTime;

    // Success
    global.logThis(
      `[PROXY TESTER] - [ALIVE] --> ${proxyInfo} - [LATENCY]: ${elapsedTime}ms`,
      "info"
    );

    let validProxy = proxy.replace("http://", "");

    validProxy = {
      proxy: validProxy,
      latency: elapsedTime,
    };

    return { isValid: true, data: validProxy };
  } catch (e) {
    // console.log(`Error: ${e.message}`);
    global.logThis(`[PROXY TESTER] - [DEAD] --> ${proxyInfo}`, "error");
    return { isValid: false, data: null };
  }
};

// ------------------------ TESTING ------------------------
// Test the traffic is actually being routed through the proxy
const proxyTrafficTest = async () => {
  try {
    const proxy = await fetchRandomProxy();

    // Target website URL
    // const targetUrl = "https://ident.me/ip";
    const targetUrl = urls.proxyUrls.trafficTest;

    // Create a new Proxy Agent
    const proxyAgent = new HttpsProxyAgent(proxy);
    // console.log(`proxyAgent: `, proxyAgent);

    // Fetch the target website using the proxy agent
    const response = await fetch(targetUrl, { agent: proxyAgent });

    const html = await response.text();
    // console.log(html);
    console.log({ proxyToUse: proxy, responseProxy: html });
  } catch (error) {
    console.log(`ERROR in proxyTrafficTest(): `, error);
  }
};
// proxyTrafficTest();

// -----------------------------------------------------------------
