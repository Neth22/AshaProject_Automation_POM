import { expect } from "@playwright/test";
export class SimulatorLogin {
  constructor(page) {
    this.page = page;

    this.simulatorLoginUrl = "https://asha-securities-web.innov8hrm.com/simulator/login";

    //locators
    this.emailInput = page.locator('[type="email"]');
    this.passwordInput = page.locator('[type="password"]');
    this.continueBtn = page.getByRole("button", { name: "Continue" });

    //toggle password visibility
    this.showPassword = page.getByRole("button", { name: "Show password" });
    this.hidePassword = page.getByRole("button", { name: "Hide password" });

    this.forgotPasswordButton = page.getByRole("button", {
      name: "Forgot Password?",
    });
    this.errorMessage = page.locator("p.text-red-500");

    this.logo = page.locator('[alt="ASHA Logo"]');
  }

  async goto() {
    await this.page.goto(this.simulatorLoginUrl);
  }

  async typeEmail(email) {
      await this.emailInput.fill(email);
    }
  
    async typePassword(password) {
      await this.passwordInput.fill(password);
    }
  
    async clickContinue() {
      await this.continueBtn.click();
    }

    async clcikForgotPassword() {
      await this.forgotPasswordButton.click();
    }
  
    //Login with valid credentials
    async login(email, password) {
      await this.typeEmail(email);
      await this.typePassword(password);
      await this.clickContinue();
    }
  
    // Verify login page UI
    async verifyLoginPage() {
      await expect(this.page).toHaveTitle("ASHA Securities Limited");
      await expect(this.page).toHaveURL(this.simulatorLoginUrl);
      await expect(this.logo).toBeVisible();
      await expect(this.emailInput).toBeVisible();
      await expect(this.emailInput).toBeEmpty();
      await expect(this.passwordInput).toBeVisible();
      await expect(this.passwordInput).toBeEmpty();
      await expect(this.continueBtn).toBeDisabled();
    }
}
