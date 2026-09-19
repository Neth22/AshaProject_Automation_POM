import test from "@playwright/test";

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
  
});
