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

  test("BUY_13: Should reject decimal quantity", async ({ page }) => {
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

  test("BUY_14: Should reject zero LIMIT price", async ({ page }) => {
    await openBuyModal();
    await buyOrder.selectOrderType("Limit");
    await buyOrder.enterQuantity(10);
    await buyOrder.enterPrice(0);
    await buyOrder.submitBuyButton.click();

    //verify error msg
    await expect(
      page.getByText("✗ Price must be greater than 0.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("BUY_15: Should reject negative LIMIT price", async ({ page }) => {
    await openBuyModal();
    await buyOrder.selectOrderType("Limit");
    await buyOrder.enterQuantity(10);
    await buyOrder.enterPrice(-10);
    await buyOrder.submitBuyButton.click();

    //verify error msg
    await expect(
      page.getByText("✗ Price must be greater than 0.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("BUY_16: Should accept valid LIMIT price", async ({ page }) => {
    await openBuyModal();
    await buyOrder.selectOrderType("Limit");
    const market = await getMarketPrice(page, TEST_SYMBOL, "Buy", 1);
    expect(market.success).toBeTruthy();
    const validPrice = 15;
    await buyOrder.enterPrice(validPrice);
    expect(await buyOrder.getPriceNumber()).toBeCloseTo(validPrice, 2);
  });

  test("BUY_17: Should update Order Value when quantity changes", async ({
    page,
  }) => {
    await openBuyModal();

    await buyOrder.selectOrderType("Market");

    // ============================================
    // Quantity = 10
    // ============================================

    await buyOrder.enterQuantity(10);

    const firstApiResponse = await getMarketPrice(page, TEST_SYMBOL, "Buy", 10);

    expect(firstApiResponse.success).toBeTruthy();
    expect(firstApiResponse.data).toBeDefined();

    const firstExpectedOrderValue = Number(firstApiResponse.data.total);

    expect(firstExpectedOrderValue).toBeGreaterThan(0);

    // Wait until UI calculation matches API
    await expect
      .poll(async () => await buyOrder.getOrderValue())
      .toBeCloseTo(firstExpectedOrderValue, 2);

    const firstOrderValue = await buyOrder.getOrderValue();

    expect(firstOrderValue).toBeCloseTo(firstExpectedOrderValue, 2);

    // ============================================
    // Quantity = 100
    // ============================================

    await buyOrder.enterQuantity(100);

    const secondApiResponse = await getMarketPrice(
      page,
      TEST_SYMBOL,
      "Buy",
      100,
    );

    expect(secondApiResponse.success).toBeTruthy();
    expect(secondApiResponse.data).toBeDefined();

    const secondExpectedOrderValue = Number(secondApiResponse.data.total);

    expect(secondExpectedOrderValue).toBeGreaterThan(0);

    // Wait until UI finishes recalculating
    await expect
      .poll(async () => await buyOrder.getOrderValue())
      .toBeCloseTo(secondExpectedOrderValue, 2);

    const secondOrderValue = await buyOrder.getOrderValue();

    expect(secondOrderValue).toBeCloseTo(secondExpectedOrderValue, 2);

    // ============================================
    // Verify quantity increase changes Order Value
    // ============================================

    expect(secondOrderValue).toBeGreaterThan(firstOrderValue);
  });

  test("BUY_18: Should update Order Value when Limit Price changes", async () => {
    await openBuyModal();

    // Select Limit order
    await buyOrder.selectOrderType("Limit");

    // Enter quantity
    await buyOrder.enterQuantity(10);

    // Enter first limit price
    await buyOrder.enterPrice(16.0);

    // Wait until Order Value is calculated
    await expect
      .poll(async () => await buyOrder.getOrderValue())
      .toBeGreaterThan(0);

    const firstOrderValue = await buyOrder.getOrderValue();

    expect(firstOrderValue).toBeGreaterThan(0);

    // Change Limit Price
    await buyOrder.enterPrice(17.0);

    // Order Value should increase
    await expect
      .poll(async () => await buyOrder.getOrderValue())
      .toBeGreaterThan(firstOrderValue);

    const secondOrderValue = await buyOrder.getOrderValue();

    expect(secondOrderValue).toBeGreaterThan(firstOrderValue);
  });

  test("BUY_19: Should calculate Net Value correctly", async () => {
    await openBuyModal();

    await buyOrder.selectOrderType("Market");
    await buyOrder.enterQuantity(100);

    // Wait until Order Value is actually calculated
    await expect
      .poll(async () => await buyOrder.getOrderValue())
      .toBeGreaterThan(0);

    // Wait until Commission is calculated
    await expect
      .poll(async () => await buyOrder.getCommission())
      .toBeGreaterThan(0);

    // Read the calculated values
    const orderValue = await buyOrder.getOrderValue();
    const commission = await buyOrder.getCommission();

    expect(orderValue).toBeGreaterThan(0);
    expect(commission).toBeGreaterThan(0);

    // Net Value = Order Value + Commission
    await expect
      .poll(async () => await buyOrder.getNetValue())
      .toBeCloseTo(orderValue + commission, 2);

    const netValue = await buyOrder.getNetValue();

    expect(netValue).toBeCloseTo(orderValue + commission, 2);
  });

  test("BUY_20: Should prevent submission when Confirm is unchecked", async () => {
    await openBuyModal();
    await buyOrder.enterQuantity(100);
    await buyOrder.uncheckConfirm();
    expect(await buyOrder.isConfirmChecked()).toBe(false);
    await expect(buyOrder.submitBuyButton).toBeDisabled();
  });

  test("BUY_21: Should submit valid MARKET Buy order", async ({ page }) => {
    await openBuyModal();
    const market = await getMarketPrice(page, TEST_SYMBOL, "Buy", 1);
    expect(market.success).toBeTruthy();
    const quantity = 1;
    await buyOrder.selectOrderType("MARKET");
    await buyOrder.enterQuantity(quantity);
    await buyOrder.checkConfirm();
    /* * Start waiting BEFORE clicking BUY. */ const orderResponsePromise =
      page.waitForResponse((response) =>
        isApiResponse(response, ORDERS, "POST"),
      );
    await buyOrder.submitBuy();
    const response = await orderResponsePromise;
    expect(response.ok()).toBeTruthy();
    const requestBody = response.request().postDataJSON();
    /* * Verify actual API request. */ expect(requestBody.symbol).toBe(
      TEST_SYMBOL,
    );
    expect(requestBody.side).toBe("Buy");
    expect(Number(requestBody.quantity)).toBe(quantity);
    expect(requestBody.orderType).toBe("Market");
    /* * Verify API response. */ const body = await response.json();
    expect(body.success).toBeTruthy();

    await expect(
      page.getByText("✓ Order placed successfully!", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("BUY_22: Should submit valid LIMIT Buy order", async ({ page }) => {
    await openBuyModal();
    const quantity = 1;
    const market = await getMarketPrice(page, TEST_SYMBOL, "Buy", quantity);
    expect(market.success).toBeTruthy();
    const price = 12.34;
    expect(typeof price).toBe("number");
    await buyOrder.selectOrderType("Limit");
    await buyOrder.enterQuantity(quantity);
    await buyOrder.enterPrice(price);
    await buyOrder.checkConfirm();
    const orderResponsePromise = page.waitForResponse((response) =>
      isApiResponse(response, ORDERS, "POST"),
    );
    await buyOrder.submitBuy();
    const response = await orderResponsePromise;
    expect(response.ok()).toBeTruthy();
    const requestBody = response.request().postDataJSON();
    expect(requestBody.symbol).toBe(TEST_SYMBOL);
    expect(requestBody.side).toBe("Buy");
    expect(Number(requestBody.quantity)).toBe(quantity);
    expect(requestBody.orderType).toBe("Limit");
    expect(Number(requestBody.limitPrice)).toBeCloseTo(price, 2);
    const body = await response.json();
    expect(body.success).toBeTruthy();

    await expect(
      page.getByText("✓ Order placed successfully!", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("BUY_23: Should reject order when buying power is insufficient", async ({
    page,
  }) => {
    await openBuyModal();
    const me = await getMe(page);
    expect(me.success).toBeTruthy();
    const buyingPower = getBuyingPower(me);
    expect(buyingPower).not.toBeNull();
    const market = await getMarketPrice(page, TEST_SYMBOL, "Buy", 1);
    expect(market.success).toBeTruthy();
    const price = market.data.pricePerShare;
    const invalidQuantity = Math.floor(buyingPower / price) + 1;
    await buyOrder.selectOrderType("MARKET");
    await buyOrder.enterQuantity(invalidQuantity);
    await buyOrder.checkConfirm();

    await buyOrder.submitBuyButton.click();

    //verify error msg
    await expect(
      page.getByText("✗ Insufficient buying power for this buy order", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("BUY_24: Should return valid Order Ticket data", async ({ page }) => {
    await openBuyModal();
    const ticket = await getOrderTicket(page, TEST_SYMBOL, "Buy", "Limit");
    expect(ticket.success).toBeTruthy();
    expect(ticket.data).toBeDefined();
  });
});
