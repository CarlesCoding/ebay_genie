import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import path from "path";
import fs from "fs/promises";
import { getFilePath, readJsonFile } from "../../helpers.js";
import axios from "axios";
import { axiosTestProxy } from "../../services/axios.js";
import { urls } from "../../utilities/urls.js";
const data = await readJsonFile("./config/config.json");
const timeout = data.CONNECTION_TIMEOUT_LIMIT;

export const getProxyFile = async () => {
  const filePath = getFilePath("proxies");
  let p = path.join(process.cwd(), filePath);
  let contents = await fs.readFile(p, "utf8");
  if (contents.includes("ip:port:username:password")) {
    return null;
  } else {
    return contents;
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

  // Check if credentials are present
  if (proxyWithoutPrefix.includes("@")) {
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

export const getRandomProxy = async () => {
  let list = (await getProxyFile()).split("\n");
  let proxy = list[Math.floor(Math.random() * list.length)];
  let formatted = parseProxyString(proxy);
  return formatted;
};

export const fetchWithProxies = async (url, headers) => {
  try {
    // Get a random proxy
    const proxy = await getRandomProxy();

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

export const testProxy = async (proxy, validProxies) => {
  const { ip, port } = extractProxyInfo(proxy);
  let proxyInfo = `${ip}:${port}`;

  try {
    const startTime = new Date();

    // Test the proxy
    const axiosInstance = await axiosTestProxy(proxy).get();
    // await axiosInstance.get();

    const elapsedTime = new Date() - startTime;

    // Success
    global.logThis(
      `[PROXY TESTER] - [ALIVE] --> ${proxyInfo} - [LATENCY]: ${elapsedTime}ms`,
      "info"
    );

    let validProxy = proxy.replace("http://", "");

    // Push the valid proxy into the validProxies array
    validProxies.push(validProxy);

    const pInfo = {
      proxy: validProxy,
      latency: elapsedTime,
    };

    return pInfo; // Use the time in to filter out proxies
  } catch (e) {
    // console.log(`Error: ${e.message}`);
    global.logThis(`[PROXY TESTER] - [DEAD] --> ${proxyInfo}`, "error");
  }
};

export const saveProxies = async (proxies) => {
  // Get correct path
  const fpath = getFilePath("proxies");

  // Set filePath
  const filePath = path.join(process.cwd(), fpath);

  // Write proxies to the file, overwriting if it exists
  await fs.writeFile(filePath, proxies.join("\n"));

  global.logThis(`[PROXY TESTER] - Proxies Saved!`, "success");
};

export const areProxiesValidFormat = (proxies) => {
  // Check if proxies is an array
  if (!Array.isArray(proxies)) {
    return false;
  }

  // Check if all elements in proxies are strings
  for (const proxy of proxies) {
    if (typeof proxy !== "string") {
      return false;
    }
  }

  return true;
};

// ------------------------ TESTING ------------------------
// Test the traffic is actually being routed through the proxy
const proxyTrafficTest = async () => {
  try {
    const proxy = await getRandomProxy();

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
