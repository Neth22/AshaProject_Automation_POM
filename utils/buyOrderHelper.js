import {
  ME,
  MARKET_PRICE,
  ORDER_TICKET,
  ORDER_BOOK,
  PORTFOLIO,
} from "./marketDataHelper.js";

/*
 * =========================================================
 * AUTHENTICATION
 * =========================================================
 *
 * The application may keep authentication in:
 * - localStorage
 * - sessionStorage
 * - browser cookies
 *
 * page.request automatically shares the browser context cookies.
 * For token-based authentication, we also try to find the token
 * from browser storage.
 */

async function getAuthToken(page) {
  const token = await page.evaluate(() => {
    const storageKeys = [
      ...Object.keys(localStorage),
      ...Object.keys(sessionStorage),
    ];

    for (const key of storageKeys) {
      const localValue = localStorage.getItem(key);
      const sessionValue = sessionStorage.getItem(key);

      const value = localValue || sessionValue;

      if (!value) {
        continue;
      }

     

      const cleanedValue = value.replace(/^Bearer\s+/i, "").trim();

     
      if (cleanedValue.split(".").length === 3 && cleanedValue.length > 50) {
        return cleanedValue;
      }

      /*
       * Sometimes the token is stored inside a JSON object.
       */
      try {
        const parsed = JSON.parse(value);

        if (parsed && typeof parsed === "object") {
          const possibleTokenKeys = [
            "token",
            "accessToken",
            "access_token",
            "authToken",
            "jwt",
            "idToken",
          ];

          for (const tokenKey of possibleTokenKeys) {
            if (parsed[tokenKey] && typeof parsed[tokenKey] === "string") {
              return parsed[tokenKey].replace(/^Bearer\s+/i, "");
            }
          }
        }
      } catch {
       
      }
    }

    return null;
  });

  return token;
}

/*
 * =========================================================
 * AUTHENTICATED GET
 * =========================================================
 */

async function authenticatedGet(page, url) {
  const token = await getAuthToken(page);

  /*
   * If a token exists, explicitly send it.
   */
  if (token) {
    return await page.request.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /*
   * If no token was found, still use page.request.  
   */
  return await page.request.get(url);
}

/*
 * =========================================================
 * GET /me
 * =========================================================
 */

export async function getMe(page) {
  const response = await authenticatedGet(page, ME);

  if (!response.ok()) {
    throw new Error(`GET /me failed: ${response.status()}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error("GET /me returned success=false");
  }

  return body;
}

/*
 * =========================================================
 * GET /market-price/{symbol}
 * =========================================================
 */

export async function getMarketPrice(page, symbol, side = "Buy", quantity = 1) {
  const url =
    `${MARKET_PRICE}/${encodeURIComponent(symbol)}` +
    `?side=${encodeURIComponent(side)}` +
    `&quantity=${encodeURIComponent(quantity)}`;

  const response = await authenticatedGet(page, url);

  if (!response.ok()) {
    throw new Error(`GET market-price failed: ${response.status()}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error("market-price returned success=false");
  }

  return body;
}

/*
 * =========================================================
 * GET /order-ticket/{symbol}
 * =========================================================
 */

export async function getOrderTicket(
  page,
  symbol,
  side = "Buy",
  orderType = "Limit",
) {
  const url =
    `${ORDER_TICKET}/${encodeURIComponent(symbol)}` +
    `?side=${encodeURIComponent(side)}` +
    `&orderType=${encodeURIComponent(orderType)}`;

  const response = await authenticatedGet(page, url);

  if (!response.ok()) {
    throw new Error(`GET order-ticket failed: ${response.status()}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error("order-ticket returned success=false");
  }

  return body;
}

/*
 * =========================================================
 * GET /order-book/{symbol}
 * =========================================================
 */

export async function getOrderBook(page, symbol) {
  const url = `${ORDER_BOOK}/${encodeURIComponent(symbol)}`;

  const response = await authenticatedGet(page, url);

  if (!response.ok()) {
    throw new Error(`GET order-book failed: ${response.status()}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error("order-book returned success=false");
  }

  return body;
}

/*
 * =========================================================
 * GET /portfolio
 * =========================================================
 */

export async function getPortfolio(page) {
  const response = await authenticatedGet(page, PORTFOLIO);

  if (!response.ok()) {
    throw new Error(`GET portfolio failed: ${response.status()}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error("portfolio returned success=false");
  }

  return body;
}

/*
 * =========================================================
 * NUMERIC FIELD HELPER
 * ========================================================= */

export function getNumericField(object, possibleNames) {
  for (const name of possibleNames) {
    if (object && object[name] !== undefined && object[name] !== null) {
      const value = Number(object[name]);

      if (!Number.isNaN(value)) {
        return value;
      }
    }
  }

  return null;
}

/*
 * =========================================================
 * BUYING POWER
 * ========================================================= */

export function getBuyingPower(me) {
  const data = me?.data;

  return (
    getNumericField(data, [
      "buyingPower",
      "availableBuyingPower",
      "buying_power",
    ]) ??
    getNumericField(data?.client, [
      "buyingPower",
      "availableBuyingPower",
      "buying_power",
    ])
  );
}

/*
 * =========================================================
 * CLIENT ID
 * ========================================================= */

export function getClientId(me) {
  const data = me?.data;

  return (
    data?.clientId ??
    data?.clientID ??
    data?.client?.clientId ??
    data?.client?.clientID ??
    data?.client?.id ??
    null
  );
}

/*
 * =========================================================
 * CLIENT NAME
 * ========================================================= */

export function getClientName(me) {
  const data = me?.data;

  return (
    data?.clientName ?? data?.client?.clientName ?? data?.client?.name ?? null
  );
}
