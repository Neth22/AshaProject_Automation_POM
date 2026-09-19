import { expect } from "@playwright/test";
export class SimulatorRegisterPage {
  constructor(page) {
    this.page = page;
    this.registerUrl =
      "https://asha-securities-web.innov8hrm.com/simulator/profile";

    //locators
    this.displayNameInput = page.locator("#displayName");
    this.userNameInput = page.locator("#username");
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    //buttons
    this.continueBtn = page.getByRole("button", { name: "Continue" });
    this.signInBtn = page.getByRole("link", { name: "Sign in" });
    this.backBtn = page.getByRole("button", { name: "Back to Introduction" });

    // toggle pwd

    this.eyeIconShow = page.getByRole("button", { name: "Show password" });
    this.eyeIconHide = page.getByRole("button", { name: "Hide password" });

    // error message
    this.errorMessage = page.locator("p.text-red-400");

    // Logo
    this.logo = page.locator('[alt="ASHA Securities Limited"]');
  }

  async goto() {
    await this.page.goto(this.registerUrl);
  }

  async enterDisplayName(displayNameInput) {
    await this.displayNameInput.fill(displayNameInput);
  }

  async enterUserName(userNameInput) {
    await this.userNameInput.fill(userNameInput);
  }

  async enterEmail(emailInput) {
    await this.emailInput.fill(emailInput);
  }

  async enterPassword(passwordInput) {
    await this.passwordInput.fill(passwordInput);
  }

  async clickContinue() {
    await this.continueBtn.click();
  }

  async userRegisteration(
    displayNameInput,
    userNameInput,
    emailInput,
    passwordInput,
  ) {
    await this.enterDisplayName(displayNameInput);
    await this.enterUserName(userNameInput);
    await this.enterEmail(emailInput);
    await this.enterPassword(passwordInput);
    await this.clickContinue();
  }

  async verifyRegisterPage() {
    await expect(this.page).toHaveTitle("ASHA Securities Limited");

    await expect(this.page).toHaveURL(this.registerUrl);

    await expect(this.logo).toBeVisible();

    await expect(this.page.locator("h1.text-center")).toHaveText(
      "CREATE YOUR PROFILE ",
    );

    await expect(this.displayNameInput).toBeVisible();
    await expect(this.displayNameInput).toBeEmpty();

    await expect(this.userNameInput).toBeVisible();
    await expect(this.userNameInput).toBeEmpty();

    await expect(this.emailInput).toBeVisible();
    await expect(this.emailInput).toBeEmpty();

    await expect(this.passwordInput).toBeVisible();
    await expect(this.passwordInput).toHaveAttribute("type", "password");

    await expect(this.continueBtn).toBeVisible();
    await expect(this.continueBtn).toBeDisabled();

    await expect(this.signInBtn).toBeVisible();
    await expect(this.backBtn).toBeVisible();
  }

  async verifyRequiredFieldErrors() {
    await expect(this.errorMessage.nth(0)).toHaveText(
      "Display name is required.",
    );

    await expect(this.errorMessage.nth(1)).toHaveText("Username is required.");

    await expect(this.errorMessage.nth(2)).toHaveText("Email is required.");

    await expect(this.errorMessage.nth(3)).toHaveText("Password is required.");
  }
}
