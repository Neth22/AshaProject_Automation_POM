import test from "@playwright/test";
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

  test("SDGN 01: Should display all initial UI elements correctly", async () => {
    await simulatorDashboard.verifyDashboard();
  });
});
