import test, { expect } from "@playwright/test";
import { SimulatorLogin } from "../pages/SimulatorLoginPage.js";

test.describe("Simulator Login Test Cases", () => {
  let simulatorLogin;

  test.beforeEach(async ({ page }) => {
    simulatorLogin = new SimulatorLogin(page);
    await simulatorLogin.goto();
  });

  test("SLGN_01: Should display all initial UI elements correctly", async () => {
    await simulatorLogin.verifyLoginPage();
  });

  test("SLGN 02 : Should toggle password visibility when clicking eye icon", async () => {
    await simulatorLogin.typePassword("simulator@1234");

    await expect(simulatorLogin.passwordInput).toHaveAttribute("type", "password");

    await simulatorLogin.showPassword.click();

    await simulatorLogin.hidePassword.click();
  });
});
