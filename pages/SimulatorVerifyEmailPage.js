import { expect } from "@playwright/test";

export class SimulatorVerifyEmailPage {
  constructor(page) {
    this.page = page;

    this.verifyOtpUrl =
      "https://asha-securities-web.innov8hrm.com/simulator/profile/verifyOtp";

    // Locators
    this.emailInput = page.locator("#email");
    this.otpInput = page.locator("#code");

    // Buttons
    this.continueBtn = page.getByRole("button", {
      name: "Continue",
    });

    this.resendCodeBtn = page.getByText("Resend code");

    // Back
    this.backBtn = page.getByText("Back");

    // Heading
    this.heading = page.getByRole("heading", {
      name: "VERIFY YOUR EMAIL",
    });

    // Description
    this.description = page.getByText(
      "Enter your email and the code we sent you",
    );

    // Error
    this.errorMessage = page.locator("div.text-red-400");
    this.errorMessage2 = page.locator("p.text-red-400");
  }

  async goto(email) {
    await this.page.goto(
      `${this.verifyOtpUrl}?email=${encodeURIComponent(email)}`,
    );
  }

  async verifyPageUrl() {
    await expect(this.page).toHaveURL(
      /\/simulator\/profile\/verifyOtp\?email=/,
    );
  }

  async verifyPageUI(email) {
    await this.verifyPageUrl();

    await expect(this.heading).toBeVisible();

    await expect(this.description).toBeVisible();

    await expect(this.emailInput).toBeVisible();

    await expect(this.emailInput).toHaveValue(email);

    await expect(this.otpInput).toBeVisible();

    await expect(this.continueBtn).toBeVisible();

    await expect(this.resendCodeBtn).toBeVisible();

    await expect(this.backBtn).toBeVisible();
  }

  async enterOtp(otp) {
    await this.otpInput.fill(otp);
  }

  async clickContinue() {
    await this.continueBtn.click();
  }

  async verifyOtp(otp) {
    await this.enterOtp(otp);
    await this.clickContinue();
  }

  async clickResendCode() {
    await this.resendCodeBtn.click();
  }
}