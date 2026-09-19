import test, { expect } from "@playwright/test";
import { SimulatorRegisterPage } from "../pages/SimulatorRegisterPage.js";

test.describe("Simulator Register Test Cases", () => {
  let simulatorRegister;

  test.beforeEach(async ({ page }) => {
    simulatorRegister = new SimulatorRegisterPage(page);
    await simulatorRegister.goto();
  });

  test("SRGN_01: Should display all initial UI elements correctly", async () => {
    await simulatorRegister.verifyRegisterPage();
  });

  test("SRGN 02 : Should toggle password visibility when clicking eye icon", async () => {
    await simulatorRegister.enterPassword("simulator@1234");

    await expect(simulatorRegister.passwordInput).toHaveAttribute(
      "type",
      "password",
    );

    await simulatorRegister.eyeIconShow.click();

    await simulatorRegister.eyeIconHide.click();
  });
});
