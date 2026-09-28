import test, { expect } from "@playwright/test";

import { SimulatorLogin } from "../pages/SimulatorLoginPage.js";
import { SimulatorDashboardPage } from "../pages/SimulatorDashboardPage.js";
import { SimulatorSellOrderPage } from "../pages/SellOrderPage.js";

import { ORDERS, isApiResponse } from "../utils/marketDataHelper.js";

import {
  getMe,
  getMarketPrice,
  getOrderTicket,
  getOrderBook,
  getPortfolio,
  getHoldingQuantity,
} from "../utils/sellOrderHelper.js";

const TEST_SYMBOL = "ALUM.N0000";

test.describe("Simulator Sell Order Functional Tests", () => {
  let simulatorLogin;
  let simulatorDashboard;
  let sellOrder;

  // LOGIN

  test.beforeEach(async ({ page }) => {
    simulatorLogin = new SimulatorLogin(page);

    simulatorDashboard = new SimulatorDashboardPage(page);

    sellOrder = new SimulatorSellOrderPage(page);

    await simulatorLogin.goto();

    await simulatorLogin.login("nseneviratne44@gmail.com", "nuhansa@1234");

    await simulatorDashboard.verifyDashboardUrl();
  });

  // OPEN SELL MODAL

  async function openSellModal() {
    await simulatorDashboard.openSellForSecurity(TEST_SYMBOL);

    await sellOrder.verifyModalVisible();

    await sellOrder.verifySelectedSecurity(TEST_SYMBOL);
  }

  test("SELL_01: Should open Sell modal for the selected stock", async () => {
    await openSellModal();

    await sellOrder.verifySelectedSecurity(TEST_SYMBOL);
  });

  test("SELL_02: Should display Market Summary correctly", async ({ page }) => {
    await openSellModal();

    await sellOrder.verifyMarketSummaryVisible();

    const response = await getMarketPrice(page, TEST_SYMBOL, "Sell", 1);

    expect(response.success).toBeTruthy();
    expect(response.data).toBeDefined();

    expect(response.data.pricePerShare).not.toBeUndefined();

    const apiPrice = Number(response.data.pricePerShare);

    expect(Number.isNaN(apiPrice)).toBe(false);

    const uiPrice = await sellOrder.getPriceNumber();

    expect(uiPrice).toBeCloseTo(apiPrice, 2);
  });

  test("SELL_03: Should display valid client account information", async ({
    page,
  }) => {
    await openSellModal();

    const me = await getMe(page);

    expect(me.success).toBeTruthy();
    expect(me.data).toBeDefined();

    const selectedClient = await sellOrder.getSelectedClient();

    expect(selectedClient).toBeTruthy();
    expect(selectedClient.length).toBeGreaterThan(0);
  });

  test("SELL_04: Should display valid Order Book data", async ({ page }) => {
    await openSellModal();

    const orderBook = await getOrderBook(page, TEST_SYMBOL);

    expect(orderBook.success).toBeTruthy();
    expect(orderBook.data).toBeDefined();

    await sellOrder.verifyOrderBookData(orderBook);
  });

  test("SELL_05: Should display correct default Sell values", async ({
    page,
  }) => {
    await openSellModal();

    // Asset
    await expect(
      page.getByText("EQUITY", {
        exact: true,
      }),
    ).toBeVisible();

    // SELL selected
    await expect(sellOrder.sellActionButton).toBeVisible();

    // Default order type
    await sellOrder.verifyOrderType("Limit");

    // Dynamic Sell price
    const market = await getMarketPrice(page, TEST_SYMBOL, "Sell", 1);

    expect(market.success).toBeTruthy();

    const expectedPrice = Number(market.data.pricePerShare);

    const actualPrice = await sellOrder.getPriceNumber();

    expect(actualPrice).toBeCloseTo(expectedPrice, 2);
  });

  test("SELL_06: MARKET order should make Price non-editable", async () => {
    await openSellModal();

    await sellOrder.selectOrderType("Market");

    await expect(
      sellOrder.priceInput ?? sellOrder.inputs.nth(1),
    ).not.toBeEditable();
  });

  test("SELL_07: LIMIT order should make Price editable", async () => {
    await openSellModal();

    await sellOrder.selectOrderType("Limit");

    await expect(
      sellOrder.priceInput ?? sellOrder.inputs.nth(1),
    ).toBeEditable();
  });

  test("SELL_08: LIMIT order should display current Sell market price", async ({
    page,
  }) => {
    await openSellModal();

    await sellOrder.selectOrderType("Limit");

    const market = await getMarketPrice(page, TEST_SYMBOL, "Sell", 1);

    expect(market.success).toBeTruthy();

    const expectedPrice = Number(market.data.pricePerShare);

    await expect
      .poll(async () => await sellOrder.getPriceNumber())
      .toBeCloseTo(expectedPrice, 2);
  });

  test("SELL_09: Should accept valid positive integer quantity", async ({
    page,
  }) => {
    await openSellModal();

    const portfolio = await getPortfolio(page);

    const availableQuantity = getHoldingQuantity(portfolio, TEST_SYMBOL);

    expect(availableQuantity).not.toBeNull();

    expect(availableQuantity).toBeGreaterThan(0);

    await sellOrder.enterQuantity(1);

    expect(await sellOrder.getQuantity()).toBe("1");
  });

  test("SELL_10: Should prevent submission when quantity is blank", async ({
    page,
  }) => {
    await openSellModal();

    await sellOrder.clearQuantity();

    await sellOrder.submitSellButton.click();

    await expect(
      page.getByText("✗ Quantity is required.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("SELL_11: Should reject zero quantity", async ({ page }) => {
    await openSellModal();

    await sellOrder.enterQuantity(0);

    await sellOrder.submitSellButton.click();

    await expect(
      page.getByText("✗ Quantity must be a whole number greater than 0.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("SELL_13: Should reject decimal quantity", async ({ page }) => {
    await openSellModal();

    await sellOrder.enterQuantity(10.5);

    await sellOrder.submitSellButton.click();

    await expect(
      page.getByText("✗ Quantity must be a whole number greater than 0.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("SELL_14: Should reject zero LIMIT price", async ({ page }) => {
    await openSellModal();

    await sellOrder.selectOrderType("Limit");

    await sellOrder.enterQuantity(1);

    await sellOrder.enterPrice(0);

    await sellOrder.submitSellButton.click();

    await expect(
      page.getByText("✗ Price must be greater than 0.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("SELL_15: Should reject negative LIMIT price", async ({ page }) => {
    await openSellModal();

    await sellOrder.selectOrderType("Limit");

    await sellOrder.enterQuantity(1);

    await sellOrder.enterPrice(-10);

    await sellOrder.submitSellButton.click();

    await expect(
      page.getByText("✗ Price must be greater than 0.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("SELL_16: Should accept valid LIMIT price", async ({ page }) => {
    await openSellModal();

    await sellOrder.selectOrderType("Limit");

    const market = await getMarketPrice(page, TEST_SYMBOL, "Sell", 1);

    expect(market.success).toBeTruthy();

    const validPrice = Number(market.data.pricePerShare);

    expect(validPrice).toBeGreaterThan(0);

    await sellOrder.enterPrice(validPrice);

    expect(await sellOrder.getPriceNumber()).toBeCloseTo(validPrice, 2);
  });

  test("SELL_17: Should update Order Value when quantity changes", async ({
    page,
  }) => {
    await openSellModal();

    await sellOrder.selectOrderType("Market");

    const market10 = await getMarketPrice(page, TEST_SYMBOL, "Sell", 10);

    expect(market10.success).toBeTruthy();

    await sellOrder.enterQuantity(10);

    const expected10 = Number(market10.data.total);

    await expect
      .poll(async () => await sellOrder.getOrderValue())
      .toBeCloseTo(expected10, 2);

    const firstOrderValue = await sellOrder.getOrderValue();

    const market100 = await getMarketPrice(page, TEST_SYMBOL, "Sell", 100);

    expect(market100.success).toBeTruthy();

    await sellOrder.enterQuantity(100);

    const expected100 = Number(market100.data.total);

    await expect
      .poll(async () => await sellOrder.getOrderValue())
      .toBeCloseTo(expected100, 2);

    const secondOrderValue = await sellOrder.getOrderValue();

    expect(secondOrderValue).toBeGreaterThan(firstOrderValue);
  });

  test("SELL_18: Should update Order Value when Limit Price changes", async () => {
    await openSellModal();

    await sellOrder.selectOrderType("Limit");

    await sellOrder.enterQuantity(1);

    await sellOrder.enterPrice(16);

    await expect
      .poll(async () => await sellOrder.getOrderValue())
      .toBeGreaterThan(0);

    const firstOrderValue = await sellOrder.getOrderValue();

    await sellOrder.enterPrice(17);

    await expect
      .poll(async () => await sellOrder.getOrderValue())
      .toBeGreaterThan(firstOrderValue);

    const secondOrderValue = await sellOrder.getOrderValue();

    expect(secondOrderValue).toBeGreaterThan(firstOrderValue);
  });

  test("SELL_19: Should calculate Net Value correctly", async () => {
    await openSellModal();

    await sellOrder.selectOrderType("Market");

    await sellOrder.enterQuantity(1);

    await expect
      .poll(async () => await sellOrder.getOrderValue())
      .toBeGreaterThan(0);

    await expect
      .poll(async () => await sellOrder.getCommission())
      .toBeGreaterThan(0);

    const orderValue = await sellOrder.getOrderValue();

    const commission = await sellOrder.getCommission();

    const expectedNetValue = orderValue - commission;

    await expect
      .poll(async () => await sellOrder.getNetValue())
      .toBeCloseTo(expectedNetValue, 2);

    const netValue = await sellOrder.getNetValue();

    expect(netValue).toBeCloseTo(expectedNetValue, 2);
  });

  test("SELL_20: Should prevent submission when Confirm is unchecked", async () => {
    await openSellModal();

    await sellOrder.enterQuantity(1);

    await sellOrder.uncheckConfirm();

    expect(await sellOrder.isConfirmChecked()).toBe(false);

    await expect(sellOrder.submitSellButton).toBeDisabled();
  });

  test("SELL_21: Should reject quantity greater than available holdings", async ({
    page,
  }) => {
    await openSellModal();

    const portfolio = await getPortfolio(page);

    const holdingQuantity = getHoldingQuantity(portfolio, TEST_SYMBOL);

    expect(holdingQuantity).not.toBeNull();

    expect(holdingQuantity).toBeGreaterThan(0);

    const invalidQuantity = Math.floor(holdingQuantity) + 1;

    await sellOrder.selectOrderType("Market");

    await sellOrder.enterQuantity(invalidQuantity);

    await sellOrder.checkConfirm();

    await sellOrder.submitSellButton.click();

    await expect(
      page.getByText("✗ Insufficient holdings for this sell order").first(),
    ).toBeVisible();
  });

  test("SELL_22: Should submit valid MARKET Sell order", async ({ page }) => {
    await openSellModal();

    const portfolio = await getPortfolio(page);

    const holdingQuantity = getHoldingQuantity(portfolio, TEST_SYMBOL);

    expect(holdingQuantity).not.toBeNull();

    expect(holdingQuantity).toBeGreaterThan(0);
    const quantity = 1;

    const market = await getMarketPrice(page, TEST_SYMBOL, "Sell", quantity);

    expect(market.success).toBeTruthy();

    await sellOrder.selectOrderType("Market");

    await sellOrder.enterQuantity(quantity);

    await sellOrder.checkConfirm();

    const orderResponsePromise = page.waitForResponse((response) =>
      isApiResponse(response, ORDERS, "POST"),
    );

    await sellOrder.submitSell();

    const response = await orderResponsePromise;

    expect(response.ok()).toBeTruthy();

    const requestBody = response.request().postDataJSON();

    expect(requestBody.symbol).toBe(TEST_SYMBOL);

    expect(requestBody.side).toBe("Sell");

    expect(Number(requestBody.quantity)).toBe(quantity);

    expect(requestBody.orderType).toBe("Market");

    const body = await response.json();

    expect(body.success).toBeTruthy();

    expect(body.data).toBeDefined();

    expect(body.data.side).toBe("Sell");

    expect(body.data.symbol).toBe(TEST_SYMBOL);

    expect(Number(body.data.quantity)).toBe(quantity);

    expect(Number(body.data.pricePerShare)).toBeGreaterThan(0);

    expect(Number(body.data.total)).toBeGreaterThan(0);

    await expect(
      page.getByText("✓ Order placed successfully!", {
        exact: true,
      }),
    ).toBeVisible();
  });
});
