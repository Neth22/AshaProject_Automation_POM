import test, { expect } from "@playwright/test";
import { SimulatorDashboardPage } from "../pages/SimulatorDashboardPage.js";
import { SimulatorLogin } from "../pages/SimulatorLoginPage.js";

test.describe("Simulator Dashboard Test Cases", () => {
  let simulatorDashboard;
  let simulatorLogin;

  test.beforeEach(async ({ page }) => {
    simulatorDashboard = new SimulatorDashboardPage(page);
    simulatorLogin = new SimulatorLogin(page);
    await simulatorLogin.goto();
    await simulatorLogin.login("nseneviratne44@gmail.com", "nuhansa@1234");
    await simulatorDashboard.verifyDashboardUrl();
  });

  test("DASH 01: Should display all initial UI elements correctly", async () => {
    await simulatorDashboard.verifyDashboard();
  });

  //search bar functions
  test("DASH_02: Should search for a valid security", async () => {
    await simulatorDashboard.search("CIC.N0000");

    await expect(
      simulatorDashboard.page.locator("table").getByText("CIC.N0000"),
    ).toBeVisible();
  });

  test("DASH_03: Should search using company name", async () => {
    await simulatorDashboard.search("SUNSHINE HOLDINGS PLC");

    await expect(
      simulatorDashboard.page
        .locator("table")
        .getByText("SUNSHINE HOLDINGS PLC"),
    ).toBeVisible();
  });

  test("DASH_04: Search using part of a company name", async () => {
    await simulatorDashboard.search("Df");

    await expect(
      simulatorDashboard.page.locator("table").getByText("DFCC BANK PLC"),
    ).toBeVisible();
  });

  test("DASH_05: Should display no results for invalid search", async () => {
    await simulatorDashboard.search("INVALID999");

    await expect(
      simulatorDashboard.page.getByText("Invalid stock"),
    ).toBeVisible();
  });

  test("DASH_06:Should display all market data after clearing search", async () => {
    await simulatorDashboard.search("CIC.N0000");
    await simulatorDashboard.clearSearch();
    await expect(
      simulatorDashboard.page.locator("table").getByText("CIC.N0000", { exact: true }),
    ).toBeVisible();
  });

  test("DASH_07: Should display Orders menu", async () => {
  await simulatorDashboard.clickOrders();

  await expect(simulatorDashboard.marketDepthMenu).toBeVisible();
  await expect(simulatorDashboard.buyMenu).toBeVisible();
  await expect(simulatorDashboard.sellMenu).toBeVisible();
});

test("DASH_08: Should open Buy order modal", async () => {
  await simulatorDashboard.clickBuy();

  await expect(
    simul.page.getByText(/BUY/i).first(),
  ).toBeVisible();
});

test("DASH_09: Should open Market Depth order modal", async () => {
  await simulatorDashboard.clickMarketDepth();

  await expect(
    simulatorDashboard.page.getByText(/MARKET DEPTH/i).first(),
  ).toBeVisible();
});

test("DASH_10: Should open Sell order modal", async () => {
  await simulatorDashboard.clickSell();

  await expect(
    simulatorDashboard.page.getByText(/SELL/i).first(),
  ).toBeVisible();
});


});
