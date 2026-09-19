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

  test("SRGN 03 :verify all fields are required and the continue btn is disabled when any field is empty", async () => {
    await simulatorRegister.displayNameInput.fill("");
    await simulatorRegister.userNameInput.click();

    await simulatorRegister.userNameInput.fill("");
    await simulatorRegister.emailInput.click();

    await simulatorRegister.emailInput.fill("");
    await simulatorRegister.passwordInput.click();

    await simulatorRegister.passwordInput.fill("");
    await simulatorRegister.emailInput.click();

    await expect(simulatorRegister.continueBtn).toBeDisabled();

    await simulatorRegister.verifyRequiredFieldErrors();
  });

  test("SRGN 04: Should register successfully with valid details", async () => {
    await simulatorRegister.userRegisteration(
      "Nuhansa De Silva",
      "nuhansa_trader",
      "nseneviratne44@gmail.com",
      "nuhansa@1234",
    );

    await expect(simulatorRegister.page).toHaveURL(
      /\/simulator\/profile\/verifyOtp\?email=/,
    );

    await expect(
      simulatorRegister.page.getByRole("heading", {
        name: "VERIFY YOUR EMAIL",
      }),
    ).toBeVisible();

    await expect(simulatorRegister.page.locator("#email")).toHaveValue(
      "nseneviratne44@gmail.com",
    );
  });
});
