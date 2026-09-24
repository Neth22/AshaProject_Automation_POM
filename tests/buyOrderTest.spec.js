import test, { expect } from "@playwright/test";

import { SimulatorLogin } from "../pages/SimulatorLoginPage.js";
import { SimulatorDashboardPage } from "../pages/SimulatorDashboardPage.js";
import { SimulatorBuyOrderPage } from "../pages/BuyOrderPage.js";

import { ORDERS, isApiResponse, toNumber } from "../utils/marketDataHelper.js";

import {
  getMe,
  getMarketPrice,
  getOrderTicket,
  getOrderBook,
  getPortfolio,
  getBuyingPower,
} from "../utils/buyOrderHelper.js";

const TEST_SYMBOL = "ALUM.N0000";

test.describe("Simulator Buy Order Functional Tests", () => {
  let simulatorLogin;
  let simulatorDashboard;
  let buyOrder;

  //LOGIN

  test.beforeEach(async ({ page }) => {
    simulatorLogin = new SimulatorLogin(page);

    simulatorDashboard = new SimulatorDashboardPage(page);

    buyOrder = new SimulatorBuyOrderPage(page);

    await simulatorLogin.goto();

    await simulatorLogin.login("nseneviratne44@gmail.com", "nuhansa@1234");

    await simulatorDashboard.verifyDashboardUrl();
  });

  //OPEN BUY MODAL

  async function openBuyModal() {
    await simulatorDashboard.openBuyForSecurity(TEST_SYMBOL);

    await buyOrder.verifyModalVisible();

    await buyOrder.verifySelectedSecurity(TEST_SYMBOL);
  }

  test("BUY_01: Should open Buy modal for the selected stock", async () => {
    await openBuyModal();

    await buyOrder.verifySelectedSecurity(TEST_SYMBOL);
  });

  test("BUY_02: Should display Market Summary correctlyShould display Market Summary correctly", async ({
    page,
  }) => {
    await openBuyModal();

    await buyOrder.verifyMarketSummaryVisible();

    const response = await getMarketPrice(page, TEST_SYMBOL, "Buy", 1);

    expect(response).toBeTruthy();

    expect(response.data).toBeTruthy();

    expect(response.data.pricePerShare).not.toBeUndefined();

    const apiPrice = Number(response.data.pricePerShare);

    expect(Number.isNaN(apiPrice)).toBe(false);

    const uiPrice = await buyOrder.getPriceNumber();

    expect(uiPrice).toBeCloseTo(apiPrice, 2);
  });

  test("BUY_03: Should display valid Order Book data", async ({ page }) => {
    await openBuyModal();

    const orderBook = await getOrderBook(page, TEST_SYMBOL);

    expect(orderBook.success).toBeTruthy();

    expect(orderBook.data).toBeDefined();

    await buyOrder.verifyOrderBookVisible();
  });

  test("BUY_04: Should display valid client account information", async ({
    page,
  }) => {
    await openBuyModal();

    const me = await getMe(page);

    expect(me).toBeTruthy();
    expect(me.success).toBeTruthy();
    expect(me.data).toBeDefined();

    const selectedClient = await buyOrder.getSelectedClient();

    expect(selectedClient).toBeTruthy();
    expect(selectedClient.length).toBeGreaterThan(0);
  });

  test("BUY_05: Should display correct default Buy values", async ({
    page,
  }) => {
    await openBuyModal();
    /* * Asset type. */
    await expect(page.getByText("EQUITY", { exact: true })).toBeVisible();
    /* * BUY action should be selected/displayed. */ await expect(
      buyOrder.buyActionButton,
    ).toBeVisible();
    /* * Default order type. */
    await buyOrder.verifyOrderType("Limit");
    /* * Dynamic market price. */
    const market = await getMarketPrice(page, TEST_SYMBOL, "Buy", 1);
    expect(market.success).toBeTruthy();
    const expectedPrice = market.data.pricePerShare;
    const actualPrice = await buyOrder.getPriceNumber();
    expect(actualPrice).toBeCloseTo(expectedPrice, 2);
  });

  test("BUY_06: MARKET order should make Price non-editable", async () => {
    await openBuyModal();
    await buyOrder.selectOrderType("Market");
    await expect(buyOrder.priceInput).not.toBeEditable();
  });

  test("BUY_07: LIMIT order should make Price editable", async () => {
    await openBuyModal();
    await buyOrder.selectOrderType("Limit");
    await expect(buyOrder.priceInput).toBeEditable();
  });

  test("BUY_08: LIMIT order should display current market price", async ({
    page,
  }) => {
    await openBuyModal();
    await buyOrder.selectOrderType("Limit");
    const market = await getMarketPrice(page, TEST_SYMBOL, "Buy", 1);
    expect(market.success).toBeTruthy();
    const expectedPrice = market.data.pricePerShare;
    await expect
      .poll(async () => await buyOrder.getPriceNumber())
      .toBeCloseTo(expectedPrice, 2);
  });

  test("BUY_09: Should accept valid positive integer quantity", async () => {
    await openBuyModal();
    await buyOrder.enterQuantity(100);
    expect(await buyOrder.getQuantity()).toBe("100");
  });

  test("BUY_10: Should prevent submission when quantity is blank", async ({
    page,
  }) => {
    await openBuyModal();

    await buyOrder.clearQuantity();

    await buyOrder.submitBuyButton.click();

    //verify error msg
    await expect(
      page.getByText("✗ Quantity is required.", { exact: true }),
    ).toBeVisible();
  });

  test("BUY_11: Should reject zero quantity", async ({ page }) => {
    await openBuyModal();
    await buyOrder.enterQuantity(0);
    await buyOrder.submitBuyButton.click();

    //verify error msg
    await expect(
      page.getByText("✗ Quantity must be a whole number greater than 0.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("BUY_12: Should reject negative quantity", async ({ page }) => {
    await openBuyModal();
    await buyOrder.enterQuantity(-10);
    await buyOrder.submitBuyButton.click();

    //verify error msg
    await expect(
      page.getByText("✗ Quantity must be a whole number greater than 0.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("BUY_13: Should reject decimal quantity", async ({page}) => {
    await openBuyModal();
    await buyOrder.enterQuantity(10.5);
    await buyOrder.submitBuyButton.click();

    //verify error msg
    await expect(
      page.getByText("✗ Quantity must be a whole number greater than 0.", {
        exact: true,
      }),
    ).toBeVisible();
  });
});
