import {
  BASE_API,
  PORTFOLIO,
  ORDERS,
  isApiResponse,
  toNumber,
} from "./marketDataHelper.js";

// API RESPONSE MATCHERS

export function isPortfolioResponse(response) {
  return isApiResponse(response, PORTFOLIO, "GET") && response.status() === 200;
}

export function isOrdersResponse(response) {
  return isApiResponse(response, ORDERS, "GET") && response.status() === 200;
}

// ORDER UPDATE RESPONSE

export function isOrderUpdateResponse(response) {
  const responseUrl = new URL(response.url());

  const baseUrl = new URL(BASE_API);

  const ordersUrl = new URL(ORDERS);

  const method = response.request().method();

  const validMethod = ["PATCH", "PUT", "POST"].includes(method);

  return (
    responseUrl.origin === baseUrl.origin &&
    responseUrl.pathname.startsWith(ordersUrl.pathname) &&
    validMethod
  );
}

// ORDER DELETE RESPONSE

export function isOrderDeleteResponse(response) {
  const responseUrl = new URL(response.url());

  const baseUrl = new URL(BASE_API);

  const ordersUrl = new URL(ORDERS);

  const method = response.request().method();

  const validMethod = ["DELETE", "PATCH", "PUT", "POST"].includes(method);

  return (
    responseUrl.origin === baseUrl.origin &&
    responseUrl.pathname.startsWith(ordersUrl.pathname) &&
    validMethod
  );
}

// AUTHENTICATED GET

async function getAuthToken(page) {
  return page.evaluate(() => {
    const keys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];

    for (const key of keys) {
      const localValue = localStorage.getItem(key);

      const sessionValue = sessionStorage.getItem(key);

      const value = localValue || sessionValue;

      if (!value) {
        continue;
      }

      const cleaned = value.replace(/^Bearer\s+/i, "").trim();

      if (cleaned.split(".").length === 3 && cleaned.length > 50) {
        return cleaned;
      }

      try {
        const parsed = JSON.parse(value);

        if (parsed && typeof parsed === "object") {
          const possibleKeys = [
            "token",
            "accessToken",
            "access_token",
            "authToken",
            "jwt",
            "idToken",
          ];

          for (const tokenKey of possibleKeys) {
            if (parsed[tokenKey] && typeof parsed[tokenKey] === "string") {
              return parsed[tokenKey].replace(/^Bearer\s+/i, "").trim();
            }
          }
        }
      } catch {
        // Ignore non-JSON storage values.
      }
    }

    return null;
  });
}

async function authenticatedGet(page, url) {
  const token = await getAuthToken(page);

  if (token) {
    return page.request.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return page.request.get(url);
}

// GET PORTFOLIO

export async function getPortfolio(page) {
  const response = await authenticatedGet(page, PORTFOLIO);

  if (!response.ok()) {
    throw new Error(`GET /portfolio failed: ${response.status()}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error("GET /portfolio returned success=false");
  }

  return body;
}

// GET ORDERS

export async function getOrders(page) {
  const response = await authenticatedGet(page, ORDERS);

  if (!response.ok()) {
    throw new Error(`GET /orders failed: ${response.status()}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error("GET /orders returned success=false");
  }

  return body;
}

// RECURSIVE SEARCH

function walkObject(value, callback) {
  if (value === null || value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = walkObject(item, callback);

      if (result !== null) {
        return result;
      }
    }

    return null;
  }

  if (typeof value !== "object") {
    return null;
  }

  const direct = callback(value);

  if (direct !== null) {
    return direct;
  }

  for (const key of Object.keys(value)) {
    const result = walkObject(value[key], callback);

    if (result !== null) {
      return result;
    }
  }

  return null;
}

// NUMERIC FIELD

export function getNumericField(object, fieldNames) {
  if (!object || typeof object !== "object") {
    return null;
  }

  for (const name of fieldNames) {
    if (
      object[name] !== undefined &&
      object[name] !== null &&
      object[name] !== ""
    ) {
      const number = toNumber(object[name]);

      if (number !== null) {
        return number;
      }
    }
  }

  return null;
}

// FIND HOLDING

export function getHolding(portfolio, symbol) {
  return walkObject(portfolio?.data ?? portfolio, (value) => {
    const candidate =
      value.symbol ??
      value.security ??
      value.securitySymbol ??
      value.stockSymbol;

    if (
      candidate &&
      String(candidate).toUpperCase() === String(symbol).toUpperCase()
    ) {
      return value;
    }

    return null;
  });
}

// HOLDING QUANTITY

export function getHoldingQuantity(portfolio, symbol) {
  const holding = getHolding(portfolio, symbol);

  if (!holding) {
    return null;
  }

  return getNumericField(holding, [
    "quantity",
    "qty",
    "holdingQuantity",
    "totalQuantity",
  ]);
}

// HOLDING CLEARED QUANTITY

export function getClearedQuantity(portfolio, symbol) {
  const holding = getHolding(portfolio, symbol);

  if (!holding) {
    return null;
  }

  return getNumericField(holding, [
    "clearedQuantity",
    "clearedQty",
    "settledQuantity",
    "settledQty",
  ]);
}

// HOLDING AVAILABLE QUANTITY

export function getAvailableQuantity(portfolio, symbol) {
  const holding = getHolding(portfolio, symbol);

  if (!holding) {
    return null;
  }

  return getNumericField(holding, [
    "availableQuantity",
    "availableQty",
    "sellableQuantity",
    "sellableQty",
  ]);
}

// HOLDING COST

export function getHoldingCost(portfolio, symbol) {
  const holding = getHolding(portfolio, symbol);

  if (!holding) {
    return null;
  }

  return getNumericField(holding, ["totalCost", "cost", "holdingCost"]);
}

// MARKET VALUE

export function getHoldingMarketValue(portfolio, symbol) {
  const holding = getHolding(portfolio, symbol);

  if (!holding) {
    return null;
  }

  return getNumericField(holding, ["marketValue", "currentValue", "value"]);
}

// TRADED PRICE

export function getHoldingTradedPrice(portfolio, symbol) {
  const holding = getHolding(portfolio, symbol);

  if (!holding) {
    return null;
  }

  return getNumericField(holding, [
    "tradedPrice",
    "marketPrice",
    "lastPrice",
    "currentPrice",
  ]);
}

// PORTFOLIO SUMMARY

export function getPortfolioSummary(portfolio) {
  const data = portfolio?.data ?? portfolio;

  return {
    totalSecurities: getNumericField(data, [
      "totalSecurities",
      "securitiesCount",
      "numberOfSecurities",
    ]),

    totalQuantity: getNumericField(data, ["totalQuantity", "quantity"]),

    totalCost: getNumericField(data, ["totalCost", "cost"]),

    marketValue: getNumericField(data, ["marketValue", "totalMarketValue"]),

    unrealizedPL: getNumericField(data, [
      "unrealizedPL",
      "unrealizedPnl",
      "unrealizedProfitLoss",
    ]),

    unrealizedPLPercentage: getNumericField(data, [
      "unrealizedPLPercentage",
      "unrealizedPnlPercentage",
      "unrealizedProfitLossPercentage",
    ]),
  };
}

// ORDER STATUS

export const ORDER_STATUS = {
  EXECUTED: "Executed",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

// NORMALIZE ORDER STATUS

export function normalizeOrderStatus(status) {
  if (status === null || status === undefined) {
    return null;
  }

  const normalized = String(status).trim().toLowerCase();

  switch (normalized) {
    // API/UI executed equivalents
    case "executed":
    case "filled":
      return ORDER_STATUS.EXECUTED;

    // API/UI pending equivalents
    case "pending":
    case "open":
      return ORDER_STATUS.PENDING;

    // API/UI cancelled equivalents
    case "cancelled":
    case "canceled":
      return ORDER_STATUS.CANCELLED;

    // Rejected API status
    case "rejected":
      return ORDER_STATUS.REJECTED;

    default:
      return null;
  }
}

// ORDER STATUS VALIDATION

export function isValidOrderStatus(status) {
  const normalizedStatus = normalizeOrderStatus(status);

  return [
    ORDER_STATUS.EXECUTED,
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.REJECTED,
  ].includes(normalizedStatus);
}

// ORDER COLLECTION

export function getOrdersArray(ordersResponse) {
  const data = ordersResponse?.data ?? ordersResponse;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.orders)) {
    return data.orders;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.records)) {
    return data.records;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

// FIND ORDER

export function findOrder(ordersResponse, symbol, status) {
  const orders = getOrdersArray(ordersResponse);

  return orders.find((order) => {
    const orderSymbol = order.symbol ?? order.security ?? order.securitySymbol;

    const orderStatus = order.status ?? order.orderStatus;

    return (
      String(orderSymbol).toUpperCase() === String(symbol).toUpperCase() &&
      (!status ||
        String(orderStatus).toLowerCase() === String(status).toLowerCase())
    );
  });
}
