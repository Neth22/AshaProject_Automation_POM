import {
  ME,
  MARKET_PRICE,
  ORDER_TICKET,
  ORDER_BOOK,
  PORTFOLIO,
} from "./marketDataHelper";

// ....GET /me ...

export async function getMe(page) {
  const response = await page.request.get(ME);

  if (!response.ok()) {
    throw new Error(`GET /me failed: ${response.status()}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error("GET /me returned success=false");
  }

  return body;
}

//Get market price data .... GET /market-price/{symbol}
export async function getMarketPrice(page, symbol, side = "Buy", quantity = 1) {
  const url =
    `${MARKET_PRICE}/${encodeURIComponent(symbol)}` +
    `?side=${encodeURIComponent(side)}` +
    `&quantity=${encodeURIComponent(quantity)}`;

  const response = await page.request.get(url);

  if (!response.ok()) {
    throw new Error(`GET market-price failed: ${response.status()}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error("market-price returned success=false");
  }

  return body;
}

//Get order ticket data .... GET /order-ticket/{symbol}
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

  const response = await page.request.get(url);

  if (!response.ok()) {
    throw new Error(`GET order-ticket failed: ${response.status()}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error("order-ticket returned success=false");
  }

  return body;
}

//Get order book data .... GET /order-book/{symbol}

export async function getOrderBook(page, symbol) {
  const url = `${ORDER_BOOK}/${encodeURIComponent(symbol)}`;

  const response = await page.request.get(url);

  if (!response.ok()) {
    throw new Error(`GET order-book failed: ${response.status()}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error("order-book returned success=false");
  }

  return body;
}

//Get portfolio data .... GET /portfolio ....

export async function getPortfolio(page) {
  const response = await page.request.get(PORTFOLIO);

  if (!response.ok()) {
    throw new Error(`GET portfolio failed: ${response.status()}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error("portfolio returned success=false");
  }

  return body;
}

// Safely find a numeric field from an object.

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

//Extract buying power from /me.

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

//Extract client information from /me
export function getClientName(me) {
  const data = me?.data;

  return (
    data?.clientName ?? data?.client?.clientName ?? data?.client?.name ?? null
  );
}
