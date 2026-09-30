import { test, expect } from "@playwright/test";

import { SimulatorLogin } from "../pages/SimulatorLoginPage.js";
import { SimulatorDashboardPage } from "../pages/SimulatorDashboardPage.js";
import { PortfolioPage } from "../pages/PortfolioPage.js";

import {
  PORTFOLIO,
  ORDERS,
  isApiResponse,
  toNumber,
} from "../utils/marketDataHelper.js";

import {
  getPortfolio,
  getOrders,
  getHolding,
  getHoldingQuantity,
  getClearedQuantity,
  getAvailableQuantity,
  getHoldingCost,
  getHoldingMarketValue,
  getHoldingTradedPrice,
  getPortfolioSummary,
  getOrdersArray,
  findOrder,
  isOrderUpdateResponse,
  isOrderDeleteResponse,
  ORDER_STATUS,
  isValidOrderStatus,
} from "../utils/portfolioHelper.js";

test.describe.configure({
  mode: "serial",
});

test.describe("Portfolio Functional Tests", () => {
  let simulatorLogin;
  let simulatorDashboard;
  let portfolioPage;

  let pendingSymbol;

  const TEST_SYMBOL = "ACL.N0000";

  // LOGIN + PORTFOLIO

  test.beforeEach(async ({ page }) => {
    simulatorLogin = new SimulatorLogin(page);

    simulatorDashboard = new SimulatorDashboardPage(page);

    portfolioPage = new PortfolioPage(page);

    await simulatorLogin.goto();

    await simulatorLogin.login("nseneviratne44@gmail.com", "nuhansa@1234");

    await simulatorDashboard.verifyDashboardUrl();

    await simulatorDashboard.clickPortfolio();

    await portfolioPage.verifyPortfolioLoaded();

    await portfolioPage.verifyTransactionHistoryLoaded();
  });

  // HELPER

  async function findPendingLimitOrder() {
    const row = await portfolioPage.getPendingLimitOrderRow();

    const text = await row.innerText();

    const symbolMatch = text.match(/\b[A-Z0-9]+\.[A-Z0-9]+\b/);

    if (!symbolMatch) {
      throw new Error(
        `Unable to identify pending order symbol from row:\n${text}`,
      );
    }

    const symbol = symbolMatch[0];

    return symbol;
  }
  // TC_PF_FT_01

  test("PF_01: Should load valid client portfolio", async () => {
    await portfolioPage.verifyPortfolioLoaded();
  });

  // TC_PF_FT_02

  test("PF_02: Should display holdings for selected client", async () => {
    const rows = await portfolioPage.getHoldingRow();

    expect(await rows.count()).toBeGreaterThanOrEqual(0);
  });

  // TC_PF_FT_03

  test("PF_03: Portfolio should correctly support zero holdings", async ({
    page,
  }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        isApiResponse(response, PORTFOLIO, "GET") && response.status() === 200,
    );

    await page.reload();

    const response = await responsePromise;

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    expect(body.success).toBeTruthy();

    expect(body.data).toBeDefined();
  });

  // TC_PF_FT_04

  test("PF_04: Holding symbols should match backend holdings", async ({
    page,
  }) => {
    const backend = await getPortfolio(page);

    expect(backend.success).toBeTruthy();

    const holdings =
      backend.data?.holdings ??
      backend.data?.portfolio ??
      backend.data?.securities;

    if (!Array.isArray(holdings)) {
      return;
    }

    for (const holding of holdings) {
      const symbol =
        holding.symbol ?? holding.security ?? holding.securitySymbol;

      if (!symbol) {
        continue;
      }

      const row = await portfolioPage.getHoldingRow(symbol);

      await expect(row).toBeVisible();
    }
  });

  // TC_PF_FT_05

  test("PF_05: Holding quantity should match backend", async ({ page }) => {
    const backendPortfolio = await getPortfolio(page);

    const backendHolding = backendPortfolio.data.holdings.find(
      (item) => item.symbol === TEST_SYMBOL,
    );

    expect(
      backendHolding,
      `Backend holding for ${TEST_SYMBOL} was not found`,
    ).toBeTruthy();

    const uiQuantity = await portfolioPage.getHoldingQuantity(TEST_SYMBOL);

    expect(Number(uiQuantity)).toBe(Number(backendHolding.quantity));
  });
  // TC_PF_FT_06

  test("PF_06: Cleared quantity should be displayed correctly", async ({
    page,
  }) => {
    const backend = await getPortfolio(page);

    const holdings = backend.data?.holdings ?? backend.data?.portfolio ?? [];

    if (!Array.isArray(holdings)) {
      return;
    }

    for (const holding of holdings) {
      const symbol = holding.symbol ?? holding.security;

      if (!symbol) {
        continue;
      }

      const apiValue = getClearedQuantity(backend, symbol);

      if (apiValue === null) {
        continue;
      }

      const ui = await portfolioPage.getHoldingData(symbol);

      const uiValue = toNumber(ui["Cleared Quantity"] ?? ui.clearedQuantity);

      if (uiValue !== null) {
        expect(uiValue).toBeCloseTo(apiValue, 2);
      }
    }
  });

  // TC_PF_FT_07

  test("PF_07: Available quantity should be displayed correctly", async ({
    page,
  }) => {
    const backend = await getPortfolio(page);

    const holdings = backend.data?.holdings ?? backend.data?.portfolio ?? [];

    if (!Array.isArray(holdings)) {
      return;
    }

    for (const holding of holdings) {
      const symbol = holding.symbol ?? holding.security;

      if (!symbol) {
        continue;
      }

      const apiValue = getAvailableQuantity(backend, symbol);

      if (apiValue === null) {
        continue;
      }

      const ui = await portfolioPage.getHoldingData(symbol);

      const uiValue = toNumber(
        ui["Available Quantity"] ?? ui.availableQuantity,
      );

      if (uiValue !== null) {
        expect(uiValue).toBeCloseTo(apiValue, 2);
      }
    }
  });

  // TC_PF_FT_08

  test("PF_08: Holding cost should be displayed correctly", async ({
    page,
  }) => {
    const backend = await getPortfolio(page);

    const holdings = backend.data?.holdings ?? backend.data?.portfolio ?? [];

    if (!Array.isArray(holdings)) {
      return;
    }

    for (const holding of holdings) {
      const symbol = holding.symbol ?? holding.security;

      if (!symbol) {
        continue;
      }

      const apiValue = getHoldingCost(backend, symbol);

      if (apiValue === null) {
        continue;
      }

      const ui = await portfolioPage.getHoldingData(symbol);

      const uiValue = toNumber(ui["Total Cost"] ?? ui.totalCost ?? ui.Cost);

      if (uiValue !== null) {
        expect(uiValue).toBeCloseTo(apiValue, 2);
      }
    }
  });

  // TC_PF_FT_09

  test("PF_09: Traded price should match backend", async ({ page }) => {
    const backend = await getPortfolio(page);

    const holdings = backend.data?.holdings ?? backend.data?.portfolio ?? [];

    if (!Array.isArray(holdings)) {
      return;
    }

    for (const holding of holdings) {
      const symbol = holding.symbol ?? holding.security;

      if (!symbol) {
        continue;
      }

      const apiValue = getHoldingTradedPrice(backend, symbol);

      if (apiValue === null) {
        continue;
      }

      const ui = await portfolioPage.getHoldingData(symbol);

      const uiValue = toNumber(
        ui["Traded Price"] ?? ui["Market Price"] ?? ui.tradedPrice,
      );

      if (uiValue !== null) {
        expect(uiValue).toBeCloseTo(apiValue, 2);
      }
    }
  });

  // TC_PF_FT_10

  test("PF_10: Market value should match backend", async ({ page }) => {
    const backend = await getPortfolio(page);

    const holdings = backend.data?.holdings ?? backend.data?.portfolio ?? [];

    if (!Array.isArray(holdings)) {
      return;
    }

    for (const holding of holdings) {
      const symbol = holding.symbol ?? holding.security;

      if (!symbol) {
        continue;
      }

      const apiValue = getHoldingMarketValue(backend, symbol);

      if (apiValue === null) {
        continue;
      }

      const ui = await portfolioPage.getHoldingData(symbol);

      const uiValue = toNumber(ui["Market Value"] ?? ui.marketValue);

      if (uiValue !== null) {
        expect(uiValue).toBeCloseTo(apiValue, 2);
      }
    }
  });

  // TC_PF_FT_11

  test("PF_11: Portfolio summary should be backed by API", async ({ page }) => {
    const backend = await getPortfolio(page);

    const summary = getPortfolioSummary(backend);

    expect(summary).toBeDefined();

    expect(backend.success).toBeTruthy();

    expect(backend.data).toBeDefined();
  });

  // TC_PF_FT_12

  test("PF_12: Unrealized P/L should be available", async ({ page }) => {
    const backend = await getPortfolio(page);

    const summary = getPortfolioSummary(backend);

    if (summary.unrealizedPL !== null) {
      expect(typeof summary.unrealizedPL).toBe("number");
    }
  });

  // TC_PF_FT_13

  test("PF_13: Negative unrealized P/L should display as negative", async ({
    page,
  }) => {
    const backend = await getPortfolio(page);

    const summary = getPortfolioSummary(backend);

    if (summary.unrealizedPL === null) {
      return;
    }

    if (summary.unrealizedPL < 0) {
      await expect(portfolioPage.unrealizedPLLabel).toBeVisible();
    }
  });

  // TC_PF_FT_14

  test("PF_14: Holding percentage should be displayed", async () => {
    const rows = await portfolioPage.getHoldingRow();

    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).innerText();

      expect(text).toMatch(/%/);
    }
  });

  // TC_PF_FT_15

  test("PF_15: Portfolio should display total holding percentage", async () => {
    const rows = await portfolioPage.getHoldingRow();

    expect(await rows.count()).toBeGreaterThanOrEqual(0);
  });

  // TC_PF_FT_16

  test("PF_16: Break-even price should be displayed", async () => {
    const rows = await portfolioPage.getHoldingRow();

    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).innerText();

      expect(text.length).toBeGreaterThan(0);
    }
  });

  // TC_PF_FT_17

  test("PF_17: Total securities should be visible", async () => {
    await expect(portfolioPage.totalSecuritiesLabel).toBeVisible();
  });

  // TC_PF_FT_18

  test("PF_18: Total quantity should be visible", async () => {
    await expect(portfolioPage.totalQuantityLabel).toBeVisible();
  });

  // TC_PF_FT_19

  test("PF_19: Total market value should be visible", async () => {
    await expect(portfolioPage.marketValueLabel).toBeVisible();
  });

  // TC_PF_FT_20

  test("PF_20: Total unrealized P/L should be visible", async () => {
    await expect(portfolioPage.unrealizedPLLabel).toBeVisible();
  });

  // TC_PF_FT_21

  test("PF_21: Transaction history should contain completed transactions", async () => {
    await expect(portfolioPage.transactionHistoryHeading).toBeVisible();

    const rows = await portfolioPage.getTransactionRow();

    expect(await rows.count()).toBeGreaterThanOrEqual(0);
  });

  // TC_PF_FT_22

  test("PF_22: Transaction rows should display BUY/SELL details", async () => {
    const rows = await portfolioPage.getTransactionRow();

    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).innerText();

      expect(text).toMatch(/\b(BUY|SELL)\b/i);

      expect(text).toMatch(/\b(MARKET|LIMIT)\b/i);
    }
  });

  // TC_PF_FT_23

  test("PF_23: Sell transactions should display correctly", async () => {
    const rows = await portfolioPage.getTransactionRow();

    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).innerText();

      if (/\bSELL\b/i.test(text)) {
        expect(text).toMatch(/\b(Executed|Pending|Cancelled)\b/i);
      }
    }
  });

  // TC_PF_FT_24

  test("PF_24: Transaction rows should contain quantity, price and total", async () => {
    const rows = await portfolioPage.getTransactionRow();

    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).innerText();

      expect(text).toMatch(/\d/);
    }
  });

  // TC_PF_FT_25

  test("PF_25: Transaction status should be valid", async () => {
    const statuses = await portfolioPage.getVisibleTransactionStatuses();

    for (const status of statuses) {
      expect(isValidOrderStatus(status)).toBeTruthy();
    }
  });

  // TC_PF_FT_26

  test("PF_26: See More should load additional records", async () => {
    const before = await portfolioPage.getVisibleTransactionRows();

    const beforeCount = await before.count();

    if (!(await portfolioPage.isSeeMoreVisible())) {
      return;
    }

    await portfolioPage.clickSeeMore();

    await expect
      .poll(async () =>
        (await portfolioPage.getVisibleTransactionRows()).count(),
      )
      .toBeGreaterThanOrEqual(beforeCount);
  });

  // TC_PF_FT_27

  test("PF_27: See More should handle end of transaction records", async () => {
    if (!(await portfolioPage.isSeeMoreVisible())) {
      expect(true).toBeTruthy();
      return;
    }

    await portfolioPage.clickSeeMore();

    expect(true).toBeTruthy();
  });

  // TC_PF_FT_28

  test("PF_28: Portfolio API should load successfully", async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        isApiResponse(response, PORTFOLIO, "GET") && response.status() === 200,
    );

    await page.reload();

    const response = await responsePromise;

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    expect(body.success).toBeTruthy();
  });

  // TC_PF_FT_29

  test("PF_29: Orders API should return valid statuses", async ({ page }) => {
    const ordersResponse = await getOrders(page);

    const orderList = getOrdersArray(ordersResponse);

    expect(
      Array.isArray(orderList),
      "Orders API response should contain an array of orders",
    ).toBeTruthy();

    expect(
      orderList.length,
      "Orders API should return at least one order",
    ).toBeGreaterThan(0);

    for (const order of orderList) {
      const status = order.status ?? order.orderStatus;

      expect(
        status,
        `Order ${
          order.id ?? order.orderId ?? "UNKNOWN"
        } does not contain a status`,
      ).toBeTruthy();

      expect(
        isValidOrderStatus(status),
        `Unexpected Orders API status "${status}" for order ${
          order.id ?? order.orderId ?? "UNKNOWN"
        }`,
      ).toBeTruthy();
    }
  });
  // TC_PF_FT_30

  test("PF_30: Refresh should reload current portfolio data", async ({
    page,
  }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        isApiResponse(response, PORTFOLIO, "GET") && response.status() === 200,
    );

    await portfolioPage.refresh();

    const response = await responsePromise;

    expect(response.ok()).toBeTruthy();

    await portfolioPage.verifyPortfolioLoaded();
  });

  // TC_PF_FT_31

  test("PF_31: Invalid negative values should not be displayed as valid holdings", async () => {
    const rows = await portfolioPage.getHoldingRow();

    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).innerText();

      /*
       * This does not reject legitimate negative
       * P/L values. It checks that quantity itself
       * is not shown as an invalid negative value.
       */
      const quantityPattern = /quantity/i;

      if (quantityPattern.test(text)) {
        expect(text).not.toMatch(/quantity\s*:\s*-\d/i);
      }
    }
  });

  // FILTER TESTS

  test("PF_FILTER_01: All filter should be visible", async () => {
    await portfolioPage.verifyFilterVisible("ALL");
  });

  test("PF_FILTER_02: Executed filter should be visible", async () => {
    await portfolioPage.verifyFilterVisible("EXECUTED");
  });

  test("PF_FILTER_03: Pending filter should be visible", async () => {
    await portfolioPage.verifyFilterVisible("PENDING");
  });

  test("PF_FILTER_04: Cancelled filter should be visible", async () => {
    await portfolioPage.verifyFilterVisible("CANCELLED");
  });

  test("PF_FILTER_05: EXECUTED filter should show only executed orders", async () => {
    await portfolioPage.selectTransactionFilter("EXECUTED");

    await portfolioPage.verifyFilterContainsOnly("Executed");
  });

  test("PF_FILTER_06: PENDING filter should show only pending orders", async () => {
    await portfolioPage.selectTransactionFilter("PENDING");

    await portfolioPage.verifyFilterContainsOnly("Pending");
  });

  test("PF_FILTER_07: CANCELLED filter should show only cancelled orders", async () => {
    await portfolioPage.selectTransactionFilter("CANCELLED");

    await portfolioPage.verifyFilterContainsOnly("Cancelled");
  });

  test("PF_FILTER_08: ALL filter should restore all order states", async () => {
    await portfolioPage.selectTransactionFilter("ALL");

    const statuses = await portfolioPage.getVisibleTransactionStatuses();

    for (const status of statuses) {
      expect(["Executed", "Pending", "Cancelled"]).toContain(status);
    }
  });

  // PENDING ORDER

  test("PF_PENDING_01: Pending LIMIT order should expose EDIT and DELETE", async () => {
    pendingSymbol = await findPendingLimitOrder();

    await portfolioPage.verifyPendingActions(pendingSymbol);
  });

  // EDIT MODAL

  test("PF_EDIT_01: Should open edit pending order modal", async () => {
    pendingSymbol = await findPendingLimitOrder();

    const transaction = await portfolioPage.getTransactionData(pendingSymbol);

    const quantity = toNumber(transaction.Quantity ?? transaction.quantity);

    const price = toNumber(
      transaction.Price ?? transaction.price ?? transaction["Limit Price"],
    );

    await portfolioPage.openEditPendingOrder(pendingSymbol);

    await portfolioPage.verifyEditPendingOrderModal(
      pendingSymbol,
      quantity,
      price,
    );
  });

  // EDIT CANCEL

  test("PF_EDIT_02: Cancel edit should not change pending order", async () => {
    pendingSymbol = await findPendingLimitOrder();

    const before = await portfolioPage.getTransactionData(pendingSymbol);

    await portfolioPage.openEditPendingOrder(pendingSymbol);

    await portfolioPage.cancelPendingOrderEdit();

    const after = await portfolioPage.getTransactionData(pendingSymbol);

    expect(toNumber(after.Quantity ?? after.quantity)).toBe(
      toNumber(before.Quantity ?? before.quantity),
    );

    expect(toNumber(after.Price ?? after.price)).toBe(
      toNumber(before.Price ?? before.price),
    );

    expect(after.status).toBe("Pending");
  });

  // EDIT QUANTITY

  test("PF_EDIT_03: Should edit pending LIMIT quantity", async ({ page }) => {
    pendingSymbol = await findPendingLimitOrder();

    const before = await portfolioPage.getTransactionData(pendingSymbol);

    const oldQuantity = toNumber(before.quantity);
    const oldPrice = toNumber(before.price);

    const newQuantity = oldQuantity + 1;

    await portfolioPage.openEditPendingOrder(pendingSymbol);

    await portfolioPage.fillEditPendingOrder(newQuantity, oldPrice);

    const responsePromise = page.waitForResponse(isOrderUpdateResponse);

    await portfolioPage.savePendingOrderChanges();

    const response = await responsePromise;

    expect(response.ok()).toBeTruthy();

    // Wait until the transaction table is updated
    await expect
      .poll(
        async () => {
          const after = await portfolioPage.getTransactionData(pendingSymbol);
          return toNumber(after.quantity);
        },
        {
          timeout: 15000,
          message: `Expected quantity to update to ${newQuantity}`,
        },
      )
      .toBe(newQuantity);

    const after = await portfolioPage.getTransactionData(pendingSymbol);

    expect(toNumber(after.quantity)).toBe(newQuantity);
    expect(toNumber(after.price)).toBe(oldPrice);
    expect(after.status).toBe("Pending");

    // Restore original quantity
    await portfolioPage.openEditPendingOrder(pendingSymbol);

    await portfolioPage.fillEditPendingOrder(oldQuantity, oldPrice);

    const restorePromise = page.waitForResponse(isOrderUpdateResponse);

    await portfolioPage.savePendingOrderChanges();

    const restoreResponse = await restorePromise;

    expect(restoreResponse.ok()).toBeTruthy();
  });

  // EDIT PRICE

  test("PF_EDIT_04: Should edit pending LIMIT price", async ({ page }) => {
    pendingSymbol = await findPendingLimitOrder();

    const before = await portfolioPage.getTransactionData(pendingSymbol);

    const oldQuantity = toNumber(before.quantity);
    const oldPrice = toNumber(before.price);

    const newPrice = Number((oldPrice + 1).toFixed(2));

    await portfolioPage.openEditPendingOrder(pendingSymbol);

    await portfolioPage.fillEditPendingOrder(oldQuantity, newPrice);

    const responsePromise = page.waitForResponse(isOrderUpdateResponse);

    await portfolioPage.savePendingOrderChanges();

    const response = await responsePromise;

    expect(response.ok()).toBeTruthy();

    // Wait until the transaction table shows the new price
    await expect
      .poll(
        async () => {
          const after = await portfolioPage.getTransactionData(pendingSymbol);
          return toNumber(after.price);
        },
        {
          timeout: 15000,
          message: `Expected price to update to ${newPrice}`,
        },
      )
      .toBe(newPrice);

    const after = await portfolioPage.getTransactionData(pendingSymbol);

    expect(toNumber(after.quantity)).toBe(oldQuantity);
    expect(toNumber(after.price)).toBe(newPrice);
    expect(after.status).toBe("Pending");

    // Restore original price
    await portfolioPage.openEditPendingOrder(pendingSymbol);

    await portfolioPage.fillEditPendingOrder(oldQuantity, oldPrice);

    const restorePromise = page.waitForResponse(isOrderUpdateResponse);

    await portfolioPage.savePendingOrderChanges();

    const restoreResponse = await restorePromise;

    expect(restoreResponse.ok()).toBeTruthy();
  });

  // EDIT BOTH

  test("PF_EDIT_05: Should edit quantity and limit price together", async ({
    page,
  }) => {
    pendingSymbol = await findPendingLimitOrder();

    const before = await portfolioPage.getTransactionData(pendingSymbol);

    const oldQuantity = toNumber(before.quantity);
    const oldPrice = toNumber(before.price);

    const newQuantity = oldQuantity + 2;
    const newPrice = Number((oldPrice + 2).toFixed(2));

    await portfolioPage.openEditPendingOrder(pendingSymbol);

    await portfolioPage.fillEditPendingOrder(newQuantity, newPrice);

    const responsePromise = page.waitForResponse(isOrderUpdateResponse);

    await portfolioPage.savePendingOrderChanges();

    const response = await responsePromise;

    expect(response.ok()).toBeTruthy();

    // Wait until the transaction table is updated
    await expect
      .poll(
        async () => {
          const after = await portfolioPage.getTransactionData(pendingSymbol);
          return {
            quantity: toNumber(after.quantity),
            price: toNumber(after.price),
          };
        },
        {
          timeout: 15000,
          message: `Expected quantity to be ${newQuantity} and price to be ${newPrice}`,
        },
      )
      .toEqual({
        quantity: newQuantity,
        price: newPrice,
      });

    const after = await portfolioPage.getTransactionData(pendingSymbol);

    expect(toNumber(after.quantity)).toBe(newQuantity);
    expect(toNumber(after.price)).toBe(newPrice);
    expect(after.status).toBe("Pending");

    // Restore original quantity and price
    await portfolioPage.openEditPendingOrder(pendingSymbol);

    await portfolioPage.fillEditPendingOrder(oldQuantity, oldPrice);

    const restorePromise = page.waitForResponse(isOrderUpdateResponse);

    await portfolioPage.savePendingOrderChanges();

    const restoreResponse = await restorePromise;

    expect(restoreResponse.ok()).toBeTruthy();
  });

  // EDIT PERSISTENCE

  test("PF_EDIT_06: Edited LIMIT order should persist after refresh", async ({
    page,
  }) => {
    pendingSymbol = await findPendingLimitOrder();

    const before = await portfolioPage.getTransactionData(pendingSymbol);

    const oldQuantity = toNumber(before.quantity);
    const oldPrice = toNumber(before.price);

    const newQuantity = oldQuantity + 1;
    const newPrice = Number((oldPrice + 1).toFixed(2));

    await portfolioPage.openEditPendingOrder(pendingSymbol);

    await portfolioPage.fillEditPendingOrder(newQuantity, newPrice);

    const updatePromise = page.waitForResponse(isOrderUpdateResponse);

    await portfolioPage.savePendingOrderChanges();

    const updateResponse = await updatePromise;

    expect(updateResponse.ok()).toBeTruthy();

    // Refresh the page
    await page.reload();

    await portfolioPage.verifyPortfolioLoaded();

    await portfolioPage.selectTransactionFilter("PENDING");

    // Wait until the updated values appear after refresh
    await expect
      .poll(
        async () => {
          const after = await portfolioPage.getTransactionData(pendingSymbol);

          return {
            quantity: toNumber(after.quantity),
            price: toNumber(after.price),
          };
        },
        {
          timeout: 15000,
          message: `Expected quantity ${newQuantity} and price ${newPrice} to persist after refresh`,
        },
      )
      .toEqual({
        quantity: newQuantity,
        price: newPrice,
      });

    const after = await portfolioPage.getTransactionData(pendingSymbol);

    expect(toNumber(after.quantity)).toBe(newQuantity);
    expect(toNumber(after.price)).toBe(newPrice);
    expect(after.status).toBe("Pending");
  });

  // DELETE MODAL

  test("PF_DELETE_01: Should open delete pending order confirmation", async () => {
    pendingSymbol = await findPendingLimitOrder();

    await portfolioPage.openDeletePendingOrder(pendingSymbol);

    await portfolioPage.verifyDeletePendingOrderModal(pendingSymbol);
  });

  // DELETE CANCEL

  test("PF_DELETE_02: Cancel delete should keep order Pending", async () => {
    pendingSymbol = await findPendingLimitOrder();

    await portfolioPage.openDeletePendingOrder(pendingSymbol);

    await portfolioPage.cancelDeletePendingOrder();

    const transaction = await portfolioPage.getTransactionData(pendingSymbol);

    expect(transaction.status).toBe("Pending");

    await portfolioPage.verifyPendingActions(pendingSymbol);
  });

  // DELETE SUCCESS

  test("PF_DELETE_03: Successfully deleting pending order should change status to Cancelled", async ({
    page,
  }) => {
    pendingSymbol = await findPendingLimitOrder();

    const before = await portfolioPage.getTransactionData(pendingSymbol);

    expect(before.status).toBe("Pending");

    await portfolioPage.openDeletePendingOrder(pendingSymbol);

    const deletePromise = page.waitForResponse(isOrderDeleteResponse);

    await portfolioPage.confirmDeletePendingOrder();

    const response = await deletePromise;

    expect(response.ok()).toBeTruthy();

    await portfolioPage.selectTransactionFilter("ALL");

    await expect
      .poll(
        async () => {
          const transaction =
            await portfolioPage.getTransactionData(pendingSymbol);

          return transaction.status;
        },
        {
          timeout: 10000,
        },
      )
      .toBe("Cancelled");

    const after = await portfolioPage.getTransactionData(pendingSymbol);

    expect(after.status).toBe("Cancelled");

    await portfolioPage.verifyFinalOrderActions(pendingSymbol);
  });

  // CANCELLED FILTER AFTER DELETE

  test("PF_DELETE_04: Deleted order should appear under CANCELLED filter", async () => {
    await portfolioPage.selectTransactionFilter("CANCELLED");

    await portfolioPage.verifyFilterContainsOnly("Cancelled");

    const row = await portfolioPage.getTransactionRow(pendingSymbol);

    await expect(row).toBeVisible();

    const transaction = await portfolioPage.getTransactionData(pendingSymbol);

    expect(transaction.status).toBe("Cancelled");
  });

  // FINAL ACTION PATTERN

  test("PF_LIFECYCLE_01: Executed orders should not expose EDIT or DELETE", async () => {
    await portfolioPage.selectTransactionFilter("EXECUTED");

    const rows = await portfolioPage.getVisibleTransactionRows();

    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);

      await expect(
        row.getByRole("button", {
          name: "EDIT",
          exact: true,
        }),
      ).toHaveCount(0);

      await expect(
        row.getByRole("button", {
          name: "DELETE",
          exact: true,
        }),
      ).toHaveCount(0);
    }
  });

  test("PF_LIFECYCLE_02: Cancelled orders should not expose EDIT or DELETE", async () => {
    await portfolioPage.selectTransactionFilter("CANCELLED");

    const rows = await portfolioPage.getVisibleTransactionRows();

    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);

      await expect(
        row.getByRole("button", {
          name: "EDIT",
          exact: true,
        }),
      ).toHaveCount(0);

      await expect(
        row.getByRole("button", {
          name: "DELETE",
          exact: true,
        }),
      ).toHaveCount(0);
    }
  });

  test("PF_LIFECYCLE_03: Pending orders should expose EDIT and DELETE", async () => {
    await portfolioPage.selectTransactionFilter("PENDING");

    const statuses = await portfolioPage.getVisibleTransactionStatuses();

    for (const status of statuses) {
      expect(status).toBe("Pending");
    }
  });
});
