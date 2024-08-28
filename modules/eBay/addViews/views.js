import inquirer from "inquirer";
import { questions } from "./questions.js";
import { log } from "../../../helpers.js";
import {
  addViewsHeaders,
  addViewsHeadersTwo,
} from "../../../utilities/headers.js";
import { fetchWithProxies } from "../../proxyManager/proxy.js";

// https://www.zenrows.com/blog/node-fetch-proxy#free-solution

// TEST: https://www.ebay.com/itm/305524739696 (Sorry, Alex. lol)
// TEST: https://www.ebay.com/itm/315333223703

// Ebay counts a "page view" for each time a user clicks on a product on the site.
// Do not need to be logged in for it to count.
// Track from seller hub. If NOT WORKING, log into accts and view as a user.

export const handleAddViews = async () => {
  const answers = await inquirer.prompt(questions);
  const { viewCount, ebayUrl, useProxies } = answers;
  sendView(viewCount, ebayUrl, useProxies);
};

// Send Function
const send = async (ebayUrl, useProxies) => {
  // const headers = addViews;
  const headers = addViewsHeadersTwo;

  try {
    // Send Request (With or Without Proxies)
    const res = useProxies
      ? await fetchWithProxies(ebayUrl, headers)
      : await fetch(ebayUrl, { headers, timeout: 5000 });

    // Check if request was successful
    if (!res?.ok) {
      if (res.status >= 400 && res.status < 600) {
        return {
          status: "fail",
          statusMessage: `Request failed: Bad Proxy. (${res.status})`,
        };
      }

      return {
        status: "fail",
        statusMessage: `Request failed: Bad Proxy. (${res.status})`,
      };
    }

    // Return success on successful request
    return {
      status: "success",
    };
  } catch (error) {
    // Log error to user
    if (error instanceof TypeError) {
      return {
        status: "fail",
        statusMessage: `Network request failed. (Dead Proxy)`,
      };
    } else if (error.code === "ECONNRESET") {
      log(`[eBay Views] ---> Bad proxy, try a different one. (Send)`, "error");
    } else {
      log(
        `[eBay Views] ---> There has been a problem with your fetch operation:`,
        "error"
      );
    }
  }
};

// Updated sendView (Ran concurrently)
const sendView = async (viewCount, ebayUrl, useProxies) => {
  log(`[eBay Views] ---> Sending ${viewCount} views to ${ebayUrl}`, "info");

  try {
    // Track status
    let success = 0;
    let failed = 0;

    // Array to store promises
    const viewPromises = [];

    // Create promises for sending views concurrently
    for (let i = 0; i < viewCount; i++) {
      viewPromises.push(send(ebayUrl, useProxies));
    }

    // Wait for all promises to resolve
    const results = await Promise.all(viewPromises);

    // Process results
    results.forEach((result, i) => {
      if (result.status === "fail" || result.status === undefined) {
        log(
          `[eBay Views] --->  #${i + 1}/${viewCount} FAILED --> ${
            result.statusMessage
          }`,
          "error"
        );
        failed++;
      } else if (result.status === "success") {
        log(
          `[eBay Views] --->  #${i + 1}/${viewCount} views sent to ${ebayUrl}`,
          "info"
        );
        success++;
      }
    });

    // log success
    log(
      `[eBay Views] ---> Finished! ${success}/${viewCount} views successfully sent to ${ebayUrl}!`,
      "success"
    );
  } catch (error) {
    log(
      `[eBay Views] ---> There has been a problem with your sendView operation:`,
      "error"
    );
  }
};
