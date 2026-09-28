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

   test(
    "SELL_10: Should prevent submission when quantity is blank",
    async ({ page }) => {
      await openSellModal();

      await sellOrder.clearQuantity();

      await sellOrder.submitSellButton.click();

      await expect(
        page.getByText(
          "✗ Quantity is required.",
          {
            exact: true,
          },
        ),
      ).toBeVisible();
    },
  );

  test(
    "SELL_11: Should reject zero quantity",
    async ({ page }) => {
      await openSellModal();

      await sellOrder.enterQuantity(0);

      await sellOrder.submitSellButton.click();

      await expect(
        page.getByText(
          "✗ Quantity must be a whole number greater than 0.",
          {
            exact: true,
          },
        ),
      ).toBeVisible();
    },
  );

  test(
    "SELL_13: Should reject decimal quantity",
    async ({ page }) => {
      await openSellModal();

      await sellOrder.enterQuantity(10.5);

      await sellOrder.submitSellButton.click();

      await expect(
        page.getByText(
          "✗ Quantity must be a whole number greater than 0.",
          {
            exact: true,
          },
        ),
      ).toBeVisible();
    },
  );

   test(
    "SELL_14: Should reject zero LIMIT price",
    async ({ page }) => {
      await openSellModal();

      await sellOrder.selectOrderType(
        "Limit",
      );

      await sellOrder.enterQuantity(1);

      await sellOrder.enterPrice(0);

      await sellOrder.submitSellButton.click();

      await expect(
        page.getByText(
          "✗ Price must be greater than 0.",
          {
            exact: true,
          },
        ),
      ).toBeVisible();
    },
  );

  test(
    "SELL_15: Should reject negative LIMIT price",
    async ({ page }) => {
      await openSellModal();

      await sellOrder.selectOrderType(
        "Limit",
      );

      await sellOrder.enterQuantity(1);

      await sellOrder.enterPrice(-10);

      await sellOrder.submitSellButton.click();

      await expect(
        page.getByText(
          "✗ Price must be greater than 0.",
          {
            exact: true,
          },
        ),
      ).toBeVisible();
    },
  );

   test(
    "SELL_16: Should accept valid LIMIT price",
    async ({ page }) => {
      await openSellModal();

      await sellOrder.selectOrderType(
        "Limit",
      );

      const market =
        await getMarketPrice(
          page,
          TEST_SYMBOL,
          "Sell",
          1,
        );

      expect(market.success).toBeTruthy();

      const validPrice =
        Number(
          market.data.pricePerShare,
        );

      expect(validPrice).toBeGreaterThan(0);

      await sellOrder.enterPrice(
        validPrice,
      );

      expect(
        await sellOrder.getPriceNumber(),
      ).toBeCloseTo(
        validPrice,
        2,
      );
    },
  );

});
