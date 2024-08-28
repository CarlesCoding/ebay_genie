//  URL Constants
export const signup_URL = "https://signup.ebay.com/ajax/submit";
export const signIn_URL = "https://www.ebay.com/signin/s";
export const signIn_session =
  "https://signin.ebay.com/ws/eBayISAPI.dll?SignIn&ru=https%3A%2F%2Fwww.ebay.com%2F";

// Headers Options
export const getSessionHeaders = {
  authority: "signup.ebay.com",
  "cache-control": "max-age=0",
  "sec-ch-ua":
    '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "upgrade-insecure-requests": "1",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "sec-fetch-site": "same-site",
  "sec-fetch-mode": "navigate",
  "sec-fetch-user": "?1",
  "sec-fetch-dest": "document",
  referer: "https://www.ebay.com/",
  "accept-language": "en-US,en;q=0.9",
};

export const accountCreateHeaders = {
  authority: "signup.ebay.com",
  "sec-ch-ua":
    '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
  accept: "application/json",
  "x-ebay-requested-with": "XMLHttpRequest",
  "content-type": "application/json",
  "sec-ch-ua-mobile": "?0",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
  "sec-ch-ua-platform": '"Windows"',
  origin: "https://signup.ebay.com",
  "sec-fetch-site": "same-origin",
  "sec-fetch-mode": "cors",
  "sec-fetch-dest": "empty",
  referer: "https://signup.ebay.com/pa/crte?ru=https%3A%2F%2Fwww.ebay.com%2F",
  "accept-language": "en-US,en;q=0.9",
};

export const signInHeaders = {
  authority: "www.ebay.com",
  "cache-control": "max-age=0",
  "sec-ch-ua":
    '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-full-version": '"97.0.4692.71"',
  "sec-ch-ua-platform": '"Windows"',
  "sec-ch-ua-platform-version": '"10.0.0"',
  "sec-ch-ua-model": '""',
  "upgrade-insecure-requests": "1",
  origin: "https://signin.ebay.com",
  "content-type": "application/x-www-form-urlencoded",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "sec-fetch-site": "same-site",
  "sec-fetch-mode": "navigate",
  "sec-fetch-user": "?1",
  "sec-fetch-dest": "document",
  referer: "https://signin.ebay.com/",
  "accept-language": "en-US,en;q=0.9",
};

export const signIn_sessHeaders = {
  Connection: "keep-alive",
  "Cache-Control": "max-age=0",
  "sec-ch-ua":
    '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "Upgrade-Insecure-Requests": "1",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-User": "?1",
  "Sec-Fetch-Dest": "document",
  "Accept-Language": "en-US,en;q=0.9",
};

export const addViewsHeaders = {
  authority: "www.ebay.com",
  "sec-ch-ua":
    '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-full-version": '"97.0.4692.99"',
  "sec-ch-ua-platform": '"Windows"',
  "sec-ch-ua-platform-version": '"10.0.0"',
  "sec-ch-ua-model": '""',
  "upgrade-insecure-requests": "1",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "sec-fetch-site": "none",
  "sec-fetch-mode": "navigate",
  "sec-fetch-user": "?1",
  "sec-fetch-dest": "document",
  "accept-language": "en-US,en;q=0.9",
};
export const addViewsHeadersTwo = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: "https://www.ebay.com/",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-User": "?1",
  TE: "trailers",
};

export const loginHeaders = {
  authority: "www.ebay.com",
  "cache-control": "max-age=0",
  "sec-ch-ua":
    '" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "upgrade-insecure-requests": "1",
  origin: "https://signin.ebay.com",
  "content-type": "application/x-www-form-urlencoded",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "sec-fetch-site": "same-site",
  "sec-fetch-mode": "navigate",
  "sec-fetch-user": "?1",
  "sec-fetch-dest": "document",
  referer: "https://signin.ebay.com/",
  "accept-language": "en-US,en;q=0.9",
  // 'cookie':
};
