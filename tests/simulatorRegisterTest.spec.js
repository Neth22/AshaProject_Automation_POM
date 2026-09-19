import test, { expect } from "@playwright/test";
import { SimulatorRegisterPage } from "../pages/SimulatorRegisterPage.js";
import { SimulatorVerifyEmailPage } from "../pages/SimulatorVerifyEmailPage.js";

test.describe("Simulator Register Test Cases", () => {
  let simulatorRegister;
  let simulatorVerifyEmail;

  test.beforeEach(async ({ page }) => {
    simulatorRegister = new SimulatorRegisterPage(page);
     simulatorVerifyEmail = new SimulatorVerifyEmailPage(page);
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

  test("SRGN 04: Should back to intro page when click back button", async () => {
    await simulatorRegister.backBtn.click();

    await expect(simulatorRegister.page).toHaveURL(
      "https://asha-securities-web.innov8hrm.com/simulator",
    );
  });

  test("SRGN 05: Should register successfully with valid details", async () => {
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

  test("REG 06: verify email verification page UI elements", async () => {
  const email = "nseneviratne44@gmail.com";

  await simulatorVerifyEmail.goto(email);

  await simulatorVerifyEmail.verifyPageUI(email);
});


});
