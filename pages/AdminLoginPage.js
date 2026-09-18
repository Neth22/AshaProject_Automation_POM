import { expect } from "@playwright/test";
export class AdminLoginPage {
  constructor(page) {
    this.page = page;

    //login url
    ((this.loginUrl = "https://asha-securities-web.innov8hrm.com/login"),
      //locators
      (this.emailInput = page.locator('[type="email"]')));
    this.passwordInput = page.locator('[type="password"]');
    this.continueBtn = page.getByRole("button", { name: "Continue" });

    //toggle password visibility
    this.showPassword = page.getByRole("button", { name: "Show password" });
    this.hidePassword = page.getByRole("button", { name: "Hide password" });

    this.logo = page.locator('[alt="ASHA Logo"]');

    this.errorMessage = page.locator("p.text-red-500");
  }

  //navigate to login page
  async goto() {
    await this.page.goto(this.loginUrl);
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

  //Login with valid credentials
  async login(email, password) {
    await this.typeEmail(email);
    await this.typePassword(password);
    await this.clickContinue();
  }

  // Verify login page UI
  async verifyLoginPage() {
    await expect(this.page).toHaveTitle("ASHA Securities Limited");
    await expect(this.page).toHaveURL(this.loginUrl);
    await expect(this.logo).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.emailInput).toBeEmpty();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.passwordInput).toBeEmpty();
    await expect(this.continueBtn).toBeDisabled();
  }
}
