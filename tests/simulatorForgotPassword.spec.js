import test, { expect } from "@playwright/test";

import { ForgotPasswordPage } from "../pages/ForgotPasswordPage.js";
import { ForgotPasswordOtpPage } from "../pages/ForgotPasswordOtpPage.js";
import { ResetPasswordPage } from "../pages/ResetPasswordPage.js";

test.describe("Simulator Forgot Password Test Cases", () => {
  let forgotPassword;
  let forgotPasswordOtp;
  let resetPassword;

  const email = "nseneviratne44@gmail.com";

  test.beforeEach(async ({ page }) => {
    forgotPassword = new ForgotPasswordPage(page);
    forgotPasswordOtp = new ForgotPasswordOtpPage(page);
    resetPassword = new ResetPasswordPage(page);
  });

  test("FP 01: should navigate email verification page by clicking forgot password link", async () => {
    await forgotPassword.navigateFromLoginToForgotPassword();

    await forgotPassword.verifyForgotPasswordPage();
  });

  test("FP 02: Should display error message for empty email field", async () => {
    await forgotPassword.goto();

    await forgotPassword.enterEmail("");

    await forgotPassword.clickSendOtp();

    await forgotPassword.verifyEmailRequiredError();
  });

  test("FP 03: Should display browser error message for invalid email format", async () => {
    await forgotPassword.goto();

    await forgotPassword.enterEmail("test");

    await forgotPassword.clickSendOtp();

    await forgotPassword.verifyInvalidEmailFormat();
  });

  test("FP 04: Should navigate back to login page when clicking Back to Sign In", async ({
    page,
  }) => {
    await forgotPassword.goto();

    await forgotPassword.clickBackToSignIn();

    await expect(page).toHaveURL(
      "https://asha-securities-web.innov8hrm.com/simulator/login",
    );
  });

  test("FP 05: Should navigate to OTP verification screen with registered email", async () => {
    await forgotPassword.goto();

    await forgotPassword.sendOtp(email);

    await forgotPassword.verifyOtpPage(email);
  });

  test("FP 06: Should display error for invalid OTP code", async () => {
    await forgotPasswordOtp.goto(email);

    await forgotPasswordOtp.enterOtp("333333");

    await forgotPasswordOtp.clickVerifyCode();

    await forgotPasswordOtp.verifyInvalidOtpError();
  });

});
