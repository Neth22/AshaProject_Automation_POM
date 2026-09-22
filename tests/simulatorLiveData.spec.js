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
    const responsePromise = page.waitForResponse((response) =>
      isApiResponse(response, MARKET_BOARD),
    );

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
});
