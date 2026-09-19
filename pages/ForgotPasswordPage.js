import { expect } from "@playwright/test";

export class ForgotPasswordPage {
  constructor(page) {
    this.page = page;

    this.loginUrl = "https://asha-securities-web.innov8hrm.com/simulator/login";

    this.forgotPasswordUrl =
      "https://asha-securities-web.innov8hrm.com/simulator/forgot-password";

    // Locators
    this.emailInput = page.locator('[type="email"]');

    // Buttons
    this.sendOtpBtn = page.getByRole("button", {
      name: "Send OTP Code",
    });

    this.backToSignInBtn = page.getByRole("button", {
      name: "Back to Sign In",
    });

    this.forgotPasswordBtn = page.getByRole("button", {
      name: "Forgot Password?",
    });

    // Error message
    this.emailRequiredError = page.getByText("Email is required.");

    this.otpPageHeading = page.getByText("Verify Your Email");
  }

  async goto() {
    await this.page.goto(this.forgotPasswordUrl);
  }

  async navigateFromLoginToForgotPassword() {
    await this.page.goto(this.loginUrl);
    await this.forgotPasswordBtn.click();
  }

  async enterEmail(email) {
    await this.emailInput.fill(email);
  }

  async clickSendOtp() {
    await this.sendOtpBtn.click();
  }

  async clickBackToSignIn() {
    await this.backToSignInBtn.click();
  }

  async sendOtp(email) {
    await this.enterEmail(email);
    await this.clickSendOtp();
  }

  async verifyForgotPasswordPage() {
    await expect(this.page).toHaveURL(this.forgotPasswordUrl);
    await expect(this.emailInput).toBeVisible();
    await expect(this.sendOtpBtn).toBeVisible();
    await expect(this.backToSignInBtn).toBeVisible();
  }

  async verifyEmailRequiredError() {
    await expect(this.emailRequiredError).toBeVisible();
  }

  async verifyInvalidEmailFormat() {
    const validationMessage = await this.emailInput.evaluate(
      (element) => element.validationMessage,
    );

    expect(validationMessage).toContain(
      "Please include an '@' in the email address",
    );
  }

  async verifyOtpPage(email) {
    await expect(this.page).toHaveURL(
      new RegExp(
        `/simulator/forgot-password/verify-otp\\?email=${encodeURIComponent(
          email,
        )}`,
      ),
    );

    await expect(this.otpPageHeading).toBeVisible();
  }
}
