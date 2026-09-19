import { expect } from "@playwright/test";

export class ResetPasswordPage {
  constructor(page) {
    this.page = page;

    this.resetPasswordUrl =
      "https://asha-securities-web.innov8hrm.com/simulator/forgot-password/reset-password";

    this.successUrl =
      "https://asha-securities-web.innov8hrm.com/simulator/forgot-password/success";

    this.loginUrl =
      "https://asha-securities-web.innov8hrm.com/simulator/login";

    // Password fields
    this.newPasswordInput = page.getByPlaceholder(
      "Create a new password",
    );

    this.confirmPasswordInput = page.getByPlaceholder(
      "Re-enter new password",
    );

    // Buttons
    this.updatePasswordBtn = page.getByRole("button", {
      name: "Update Password",
    });

    this.backToSignInBtn = page.getByRole("button", {
      name: "Back to Sign In",
    });

    // Show / Hide password buttons
    this.showPasswordBtn = page.getByRole("button", {
      name: "Show",
    });

    this.hidePasswordBtn = page.getByRole("button", {
      name: "Hide",
    });

    // Error messages
    this.newPasswordRequiredError = page.getByText(
      "New password is required.",
    );

    this.passwordRequirementError = page.getByText(
      "Password must be at least 8 characters.",
    );

    this.passwordMismatchError = page.getByText(
      "Passwords do not match.",
    );

    // Heading
    this.resetPasswordHeading = page.getByText("Reset Password");
  }

  async goto(email, code) {
    await this.page.goto(
      `${this.resetPasswordUrl}?email=${encodeURIComponent(
        email,
      )}&code=${code}`,
    );
  }

  async enterNewPassword(password) {
    await this.newPasswordInput.fill(password);
  }

  async enterConfirmPassword(password) {
    await this.confirmPasswordInput.fill(password);
  }

  async clickUpdatePassword() {
    await this.updatePasswordBtn.click();
  }

  async updatePassword(newPassword, confirmPassword) {
    await this.enterNewPassword(newPassword);
    await this.enterConfirmPassword(confirmPassword);
    await this.clickUpdatePassword();
  }

  async verifyResetPasswordPage() {
    await expect(this.resetPasswordHeading).toBeVisible();
    await expect(this.newPasswordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.updatePasswordBtn).toBeVisible();
  }

  async verifyRequiredPasswordError() {
    await expect(this.newPasswordRequiredError).toBeVisible();
  }

  async verifyPasswordRequirementError() {
    await expect(this.passwordRequirementError).toBeVisible();
  }

  async verifyPasswordMismatchError() {
    await expect(this.passwordMismatchError).toBeVisible();
  }

  async toggleNewPasswordVisibility() {
    await this.showPasswordBtn.first().click();

    await expect(this.newPasswordInput).toHaveAttribute(
      "type",
      "text",
    );

    await this.hidePasswordBtn.first().click();

    await expect(this.newPasswordInput).toHaveAttribute(
      "type",
      "password",
    );
  }

  async verifySuccessPage() {
    await expect(this.page).toHaveURL(
      /.*\/simulator\/forgot-password\/success/,
    );
  }

  async clickBackToSignIn() {
    await this.backToSignInBtn.click();
  }
}