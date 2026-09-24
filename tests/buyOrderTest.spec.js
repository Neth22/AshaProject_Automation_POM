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
});
