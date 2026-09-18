import test, { expect } from "@playwright/test";
import { AdminLoginPage } from "../pages/AdminLoginPage";

test.describe("Admin Login Test Cases", () => {
  let adminLogin;

  test.beforeEach(async ({ page }) => {
    adminLogin = new AdminLoginPage(page);
    await adminLogin.goto();
  });

  test("LGN_01: Should display all initial UI elements correctly", async () => {
    await adminLogin.verifyLoginPage();
  });

  test("LGN 02 : Should toggle password visibility when clicking eye icon", async () => {
    await adminLogin.typePassword("test@1234");

    await expect(adminLogin.passwordInput).toHaveAttribute("type", "password");

    await adminLogin.showPassword.click();

    await adminLogin.hidePassword.click();
  });

  test("LGN 03 : Should display error message for invalid email", async () => {
    await adminLogin.typeEmail("dilmi@example.com");
    await adminLogin.typePassword("kasun@1234");
    await adminLogin.clickContinue();
    //verify error msg
    await expect(adminLogin.errorMessage).toHaveText(
      "Invalid username/email or password",
    );
  });
});
