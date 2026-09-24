import test, { expect } from "@playwright/test";
import { SimulatorLogin } from "../pages/SimulatorLoginPage.js";
import { SimulatorDashboardPage } from "../pages/SimulatorDashboardPage.js";

import {
  MARKET_OVERVIEW,
  MARKET_BOARD,
  isApiResponse,
  toNumber,
} from "../utils/marketDataHelper.js";

test.describe("Simulator Live Market Data Test Cases", () => {
  let simulatorDashboard;
  let simulatorLogin;

  test.beforeEach(async ({ page }) => {
    simulatorDashboard = new SimulatorDashboardPage(page);
    simulatorLogin = new SimulatorLogin(page);

    await simulatorLogin.goto();

    await simulatorLogin.login("nseneviratne44@gmail.com", "nuhansa@1234");

    await simulatorDashboard.verifyDashboardUrl();
  });

  test("LIVE_01: Should display current market board data from API", async ({
    page,
  }) => {
    const responsePromise = page.waitForResponse(async (response) => {
      return isApiResponse(response, MARKET_BOARD) && response.status() === 200;
    });

    await page.reload();

    const response = await responsePromise;

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    expect(body.success).toBeTruthy();
    expect(body.data).toBeDefined();
    expect(body.data.rows.length).toBeGreaterThan(0);

    const apiRow = body.data.rows.find((row) => row.symbol === "ACL.N0000");

    expect(apiRow).toBeDefined();

    const uiRow = await simulatorDashboard.getSecurityData("ACL.N0000");

    expect(uiRow.security).toBe(apiRow.symbol);
    expect(uiRow.company).toBe(apiRow.companyName);

    expect(toNumber(uiRow.bidQty)).toBe(apiRow.bidQty);

    expect(toNumber(uiRow.bidPrice)).toBeCloseTo(apiRow.bidPrice, 2);

    expect(toNumber(uiRow.askPrice)).toBeCloseTo(apiRow.askPrice, 2);

    expect(toNumber(uiRow.askQty)).toBe(apiRow.askQty);

    expect(toNumber(uiRow.last)).toBeCloseTo(apiRow.lastPrice, 2);

    expect(toNumber(uiRow.lastQty)).toBe(apiRow.lastQty);
  });

  test("LIVE_02: Should display all current market data fields", async ({
    page,
  }) => {
    const responsePromise = page.waitForResponse(async (response) => {
      return isApiResponse(response, MARKET_BOARD) && response.status() === 200;
    });

    await page.reload();

    const response = await responsePromise;

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    const apiRow = body.data.rows.find((row) => row.symbol === "ACL.N0000");

    expect(apiRow).toBeDefined();

    const uiRow = await simulatorDashboard.getSecurityData("ACL.N0000");

    expect(uiRow.security).toBe(apiRow.symbol);
    expect(uiRow.company).toBe(apiRow.companyName);

    expect(toNumber(uiRow.bidQty)).toBe(apiRow.bidQty);
    expect(toNumber(uiRow.bidPrice)).toBeCloseTo(apiRow.bidPrice, 2);

    expect(toNumber(uiRow.askPrice)).toBeCloseTo(apiRow.askPrice, 2);

    expect(toNumber(uiRow.askQty)).toBe(apiRow.askQty);

    expect(toNumber(uiRow.last)).toBeCloseTo(apiRow.lastPrice, 2);

    expect(toNumber(uiRow.lastQty)).toBe(apiRow.lastQty);

    // console.log("UI CHANGE:", JSON.stringify(uiRow.change));
    // console.log("API CHANGE:", apiRow.change);

    expect(Math.abs(toNumber(uiRow.change))).toBeCloseTo(
      Math.abs(apiRow.changePercent),
      2,
    );

    expect(toNumber(uiRow.high)).toBeCloseTo(apiRow.dayHigh, 2);

    expect(toNumber(uiRow.low)).toBeCloseTo(apiRow.dayLow, 2);

    expect(toNumber(uiRow.volume)).toBe(apiRow.volume);

    expect(toNumber(uiRow.turnover)).toBe(Math.round(apiRow.turnover));

    expect(toNumber(uiRow.trades)).toBe(apiRow.trades);

    expect(toNumber(uiRow.close)).toBeCloseTo(apiRow.priceClose, 2);
  });

  test("LIVE_03: Should display live data for multiple securities", async ({
    page,
  }) => {
    const responsePromise = page.waitForResponse(async (response) => {
      return isApiResponse(response, MARKET_BOARD) && response.status() === 200;
    });

    await page.reload();

    const response = await responsePromise;

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    const securities = ["CIC.X0000", "DIAL.N0000", "CFIN.N0000", "SINS.N0000"];

    for (const security of securities) {
      const apiRow = body.data.rows.find((row) => row.symbol === security);

      expect(apiRow).toBeDefined();

      const uiRow = await simulatorDashboard.getSecurityData(security);

      expect(uiRow.security).toBe(apiRow.symbol);

      expect(uiRow.company).toBe(apiRow.companyName);

      expect(toNumber(uiRow.bidPrice)).toBeCloseTo(apiRow.bidPrice, 2);

      expect(toNumber(uiRow.askPrice)).toBeCloseTo(apiRow.askPrice, 2);

      expect(toNumber(uiRow.last)).toBeCloseTo(apiRow.lastPrice, 2);
    }
  });

  test("LIVE_04: Should receive current market overview data", async ({
    page,
  }) => {
    const responsePromise = page.waitForResponse(async (response) => {
      return (
        isApiResponse(response, MARKET_OVERVIEW) && response.status() === 200
      );
    });

    await page.reload();

    const response = await responsePromise;

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    expect(body.success).toBeTruthy();

    expect(body.data).toBeDefined();

    expect(body.data.indices).toBeDefined();

    expect(body.data.indices.aspi).toBeDefined();

    expect(body.data.indices.spSl20).toBeDefined();

    expect(body.data.aggregates).toBeDefined();

    expect(body.data.ticker).toBeDefined();

    expect(Array.isArray(body.data.ticker)).toBeTruthy();
  });

  test("LIVE_05: Should receive valid ASI and S&P SL20 values", async ({
    page,
  }) => {
    const responsePromise = page.waitForResponse(async (response) => {
      return (
        isApiResponse(response, MARKET_OVERVIEW) && response.status() === 200
      );
    });

    await page.reload();

    const response = await responsePromise;

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    const asi = body.data.indices.aspi;

    const spSl20 = body.data.indices.spSl20;

    expect(asi.label).toBe("ASI");

    expect(typeof asi.value).toBe("number");

    expect(typeof asi.change).toBe("number");

    expect(typeof asi.changePercent).toBe("number");

    expect(spSl20.label).toBe("S&P SL20");

    expect(typeof spSl20.value).toBe("number");

    expect(typeof spSl20.change).toBe("number");

    expect(typeof spSl20.changePercent).toBe("number");
  });

  test("LIVE_06: Should receive valid market totals", async ({ page }) => {
    const responsePromise = page.waitForResponse(async (response) => {
      return (
        isApiResponse(response, MARKET_OVERVIEW) && response.status() === 200
      );
    });

    await page.reload();

    const response = await responsePromise;

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    const aggregates = body.data.aggregates;

    expect(typeof aggregates.turnover).toBe("number");

    expect(typeof aggregates.volume).toBe("number");

    expect(typeof aggregates.trades).toBe("number");

    expect(aggregates.turnover).toBeGreaterThanOrEqual(0);

    expect(aggregates.volume).toBeGreaterThanOrEqual(0);

    expect(aggregates.trades).toBeGreaterThanOrEqual(0);
  });

  test("LIVE_07: Should receive valid live ticker data", async ({ page }) => {
    const responsePromise = page.waitForResponse((response) =>
      isApiResponse(response, MARKET_OVERVIEW),
    );

    await page.reload();

    const response = await responsePromise;

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    const ticker = body.data.ticker;

    expect(Array.isArray(ticker)).toBeTruthy();

    expect(ticker.length).toBeGreaterThan(0);

    for (const item of ticker) {
      expect(item.symbol).toBeTruthy();

      expect(item.displaySymbol).toBeTruthy();

      expect(typeof item.price).toBe("number");

      expect(typeof item.change).toBe("number");

      expect(typeof item.changePercent).toBe("number");

      expect(["up", "down", "flat"]).toContain(item.direction);
    }
  });

  test("LIVE_08: Should receive multiple live market overview updates", async ({
    page,
  }) => {
    const responses = [];

    const responseHandler = (response) => {
      if (isApiResponse(response, MARKET_OVERVIEW)) {
        responses.push(response);
      }
    };

    page.on("response", responseHandler);

    try {
      await page.reload();

      await expect
        .poll(() => responses.length, {
          timeout: 30000,
        })
        .toBeGreaterThanOrEqual(2);
    } finally {
      page.off("response", responseHandler);
    }

    expect(responses.length).toBeGreaterThanOrEqual(2);

    const latestResponse = responses[responses.length - 1];

    expect(latestResponse.ok()).toBeTruthy();

    const latestBody = await latestResponse.json();

    expect(latestBody.success).toBeTruthy();

    expect(latestBody.data).toBeDefined();
  });

  test("LIVE_09: Should receive multiple live market board updates", async ({
    page,
  }) => {
    const responses = [];

    const responseHandler = (response) => {
      if (isApiResponse(response, MARKET_BOARD)) {
        responses.push(response);
      }
    };

    page.on("response", responseHandler);

    try {
      await page.reload();

      await expect
        .poll(() => responses.length, {
          timeout: 30000,
        })
        .toBeGreaterThanOrEqual(2);
    } finally {
      page.off("response", responseHandler);
    }

    expect(responses.length).toBeGreaterThanOrEqual(2);

    const latestResponse = responses[responses.length - 1];

    expect(latestResponse.ok()).toBeTruthy();

    const latestBody = await latestResponse.json();

    expect(latestBody.success).toBeTruthy();

    expect(latestBody.data.rows.length).toBeGreaterThan(0);
  });

  test("LIVE_10: Should display the latest market board data in UI", async ({
    page,
  }) => {
    const responsePromise = page.waitForResponse((response) =>
      isApiResponse(response, MARKET_BOARD),
    );

    await page.reload();

    const response = await responsePromise;

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    const apiRow = body.data.rows.find((row) => row.symbol === "ACL.N0000");

    expect(apiRow).toBeDefined();

    const uiRow = await simulatorDashboard.getSecurityData("ACL.N0000");

    expect(toNumber(uiRow.bidPrice)).toBeCloseTo(apiRow.bidPrice, 2);

    expect(toNumber(uiRow.askPrice)).toBeCloseTo(apiRow.askPrice, 2);

    expect(toNumber(uiRow.last)).toBeCloseTo(apiRow.lastPrice, 2);
  });
});
