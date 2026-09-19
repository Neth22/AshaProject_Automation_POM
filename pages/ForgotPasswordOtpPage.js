import { expect } from "@playwright/test";

export class ForgotPasswordOtpPage {
  constructor(page) {
    this.page = page;

    this.verifyOtpUrl =
      "https://asha-securities-web.innov8hrm.com/simulator/forgot-password/verify-otp";

    // OTP fields
    this.otpInput1 = page.locator("#otp-0");
    this.otpInput2 = page.locator("#otp-1");
    this.otpInput3 = page.locator("#otp-2");
    this.otpInput4 = page.locator("#otp-3");
    this.otpInput5 = page.locator("#otp-4");
    this.otpInput6 = page.locator("#otp-5");

    // Button
    this.verifyCodeBtn = page.getByRole("button", {
      name: "Verify Code",
    });

    // Error messages
    this.invalidOtpError = page.getByText(
      "Invalid or expired verification code",
    );

    this.incompleteOtpError = page.getByText(
      "Please enter the 6-digit OTP code.",
    );

    // Heading
    this.heading = page.getByText("Verify Your Email");
  }

  async goto(email) {
    await this.page.goto(
      `${this.verifyOtpUrl}?email=${encodeURIComponent(email)}`,
    );
  }

  async enterOtp(otp) {
    const otpFields = [
      this.otpInput1,
      this.otpInput2,
      this.otpInput3,
      this.otpInput4,
      this.otpInput5,
      this.otpInput6,
    ];

    for (let i = 0; i < otp.length; i++) {
      await otpFields[i].fill(otp[i]);
    }
  }

  async clickVerifyCode() {
    await this.verifyCodeBtn.click();
  }

  async verifyOtp(otp) {
    await this.enterOtp(otp);
    await this.clickVerifyCode();
  }

  async verifyInvalidOtpError() {
    await expect(this.invalidOtpError).toBeVisible();
  }

  async verifyIncompleteOtpError() {
    await expect(this.incompleteOtpError).toBeVisible();
  }

  async verifyResetPasswordPage() {
    await expect(this.page).toHaveURL(
      /.*\/simulator\/forgot-password\/reset-password\?email=.*&code=.*/,
    );

    await expect(
      this.page.getByText("Reset Password"),
    ).toBeVisible();
  }
}