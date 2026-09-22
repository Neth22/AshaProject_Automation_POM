export const MARKET_OVERVIEW =
  "https://asha-securities-cloud.innov8hrm.com/api/simulator/market-overview";

export const MARKET_BOARD =
  "https://asha-securities-cloud.innov8hrm.com/api/simulator/market-board";

/**
 * Checks whether a response belongs to the expected API endpoint.
 * Allows query parameters to exist without breaking the test.
 */
export function isApiResponse(response, endpoint) {
  const responseUrl = new URL(response.url());
  const endpointUrl = new URL(endpoint);

  return (
    responseUrl.origin === endpointUrl.origin &&
    responseUrl.pathname === endpointUrl.pathname &&
    response.request().method() === "GET"
  );
}

export function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(
    String(value).replace(/,/g, "").replace(/%/g, "").trim(),
  );

  return Number.isNaN(number) ? null : number;
}
