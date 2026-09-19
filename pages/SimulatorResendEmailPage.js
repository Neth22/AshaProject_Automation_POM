import { expect } from "@playwright/test";

export class SimulatorResendEmailPage {
  constructor(page) {
    this.page = page;

    this.url =
      "https://asha-securities-web.innov8hrm.com/simulator/profile/otpEmail";

    this.emailInput = page.locator('[type="email"]');

    this.sendCodeBtn = page.getByRole("button", {
      name: "Send Code",
    });

    this.backBtn = page.getByText("Back to Introduction");

    this.heading = page.getByRole("heading", {
      name: "VERIFY YOUR EMAIL",
    });

    this.description = page.getByText(
      "Enter your email address to receive a verification code.",
    );

    this.errorMessage = page.getByText(
      "No pending registration found for this email",
    );
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async enterEmail(email) {
    await this.emailInput.fill(email);
  }

  async clickSendCode() {
    await this.sendCodeBtn.click();
  }

  async sendCode(email) {
    await this.enterEmail(email);
    await this.clickSendCode();
  }

  async verifyPageUI() {
    await expect(this.page).toHaveURL(this.url);

    await expect(this.heading).toBeVisible();

    await expect(this.description).toBeVisible();

    await expect(this.emailInput).toBeVisible();

    await expect(this.emailInput).toHaveAttribute("type", "email");

    await expect(this.sendCodeBtn).toBeVisible();

    await expect(this.backBtn).toBeVisible();
  }
}
