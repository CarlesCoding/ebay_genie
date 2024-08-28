import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { urls } from "../utilities/urls.js";

// -------------------- Helper Function --------------------
const newAbortSignal = (timeoutMs) => {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeoutMs || 0);

  return abortController.signal;
};

// -------------------- Custom Axios Instances --------------------

export const axiosTestProxy = (proxy = "") => {
  return axios.create({
    baseURL: urls.proxyUrls.testProxy, // "https://api.ipify.org/",
    timeout: 20000,
    signal: newAbortSignal(20000), // Aborts request after 20 seconds
    httpsAgent: new HttpsProxyAgent(proxy),
  });
};
