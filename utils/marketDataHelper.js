export const BASE_API =
  "https://asha-securities-cloud.innov8hrm.com/api/simulator";

export const MARKET_OVERVIEW = `${BASE_API}/market-overview`;

export const MARKET_BOARD = `${BASE_API}/market-board`;

export const ME = `${BASE_API}/me`;

export const MARKET_PRICE = `${BASE_API}/market-price`;

export const ORDER_TICKET = `${BASE_API}/order-ticket`;

export const ORDER_BOOK = `${BASE_API}/order-book`;

export const PORTFOLIO = `${BASE_API}/portfolio`;

export const ORDERS = `${BASE_API}/orders`;

// Check API response URL + method.

export function isApiResponse(response, endpoint, method = "GET") {
  const responseUrl = new URL(response.url());
  const endpointUrl = new URL(endpoint);

  return (
    responseUrl.origin === endpointUrl.origin &&
    responseUrl.pathname === endpointUrl.pathname &&
    response.request().method() === method
  );
}

//Convert UI/API values to numbers.

export function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(
    String(value)
      .replace(/,/g, "")
      .replace(/%/g, "")
      .replace(/[▲▼]/g, "")
      .trim(),
  );

  return Number.isNaN(number) ? null : number;
}
