import test, { expect } from "@playwright/test";
import { SimulatorRegisterPage } from "../pages/SimulatorRegisterPage.js";
import { SimulatorVerifyEmailPage } from "../pages/SimulatorVerifyEmailPage.js";
import { SimulatorResendEmailPage } from "../pages/SimulatorResendEmailPage.js";

test.describe("Simulator Register Test Cases", () => {
  let simulatorRegister;
  let simulatorVerifyEmail;
  let simulatorResendEmail;

  test.beforeEach(async ({ page }) => {
    simulatorRegister = new SimulatorRegisterPage(page);
    simulatorVerifyEmail = new SimulatorVerifyEmailPage(page);
    simulatorResendEmail = new SimulatorResendEmailPage(page);
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

  //------------------- simallator verify email page test cases ---------------------
  test("REG 06: verify email verification page UI elements", async () => {
    const email = "nseneviratne44@gmail.com";

    await simulatorVerifyEmail.goto(email);

    await simulatorVerifyEmail.verifyPageUI(email);
  });

  test("REG 07: verify verification code field is empty initially", async () => {
    const email = "nseneviratne44@gmail.com";

    await simulatorVerifyEmail.goto(email);

    await expect(simulatorVerifyEmail.otpInput).toBeVisible();

    await expect(simulatorVerifyEmail.otpInput).toBeEmpty();
  });

  test("REG 08: verify verification code field is empty initially", async () => {
    const email = "nseneviratne44@gmail.com";

    await simulatorVerifyEmail.goto(email);

    await expect(simulatorVerifyEmail.otpInput).toBeVisible();

    await expect(simulatorVerifyEmail.otpInput).toBeEmpty();
  });

  test("REG 09: verify error message is displayed for invalid verification code", async () => {
    const email = "nseneviratne44@gmail.com";

    await simulatorVerifyEmail.goto(email);

    await simulatorVerifyEmail.verifyOtp("111111");

    await expect(simulatorVerifyEmail.errorMessage).toHaveText(
      "Invalid or expired verification code",
    );
  });

  test("REG 10: verify invalid verification code format is not accepted", async () => {
    const email = "nseneviratne44@gmail.com";

    await simulatorVerifyEmail.goto(email);

    await simulatorVerifyEmail.enterOtp("123");

    await simulatorVerifyEmail.clickContinue();

    await expect(simulatorVerifyEmail.errorMessage2).toHaveText(
      "Verification code must be exactly 6 digits",
    );
  });

  test("REG 11: verify verification code accepts 6 digit OTP", async () => {
    const email = "nseneviratne44@gmail.com";

    await simulatorVerifyEmail.goto(email);

    await simulatorVerifyEmail.enterOtp("123456");

    await expect(simulatorVerifyEmail.otpInput).toHaveValue("123456");
  });

  test("REG 12: verify user can resend verification code", async () => {
    const email = "nseneviratne44@gmail.com";

    await simulatorVerifyEmail.goto(email);

    await simulatorVerifyEmail.clickResendCode();

    await expect(simulatorVerifyEmail.page).toHaveURL(
      "https://asha-securities-web.innov8hrm.com/simulator/profile/otpEmail",
    );
  });

  //----------------------- simallator resend email page test cases ---------------------

  test("REG 13: verify resend email verification page UI elements", async () => {
    await simulatorResendEmail.goto();

    await simulatorResendEmail.verifyPageUI();
  });

  test("REG 14: verify error message for invalid resend email", async () => {
    await simulatorResendEmail.goto();

    await simulatorResendEmail.sendCode("nuhansa@example.com");

    await expect(simulatorResendEmail.errorMessage).toHaveText(
      "No pending registration found for this email",
    );
  });
});
