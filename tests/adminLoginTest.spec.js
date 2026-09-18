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
    await adminLogin.login("nuhan@example.com", "kasun@1234");
    //verify error msg
    await expect(adminLogin.errorMessage).toHaveText(
      "Invalid username/email or password",
    );
  });

  test("LGN 04 : Should display error message for invalid password", async () => {
    await adminLogin.login("kasun@example.com", "heshani@1234");

    //verify error msg
    await expect(adminLogin.errorMessage).toHaveText(
      "Invalid username/email or password",
    );
  });

  test("LGN 05 : should display error msg for invalid email format", async () => {
    await adminLogin.emailInput.fill("test");

    await adminLogin.passwordInput.click();
    //verify error msg
    await expect(adminLogin.errorMessage).toHaveText(
      "Please enter a valid email address.",
    );
  });

  test("LGN 06 :email field should be required", async () => {
    await adminLogin.emailInput.fill(" ");
    await adminLogin.passwordInput.fill("kasun@1234");
    await adminLogin.passwordInput.click();

    await expect(adminLogin.errorMessage).toHaveText("Email is required.");
  });

  test("LGN 07 :password field should be required", async () => {
    await adminLogin.passwordInput.fill("");
    await adminLogin.emailInput.fill("kasun@example.com");
    await adminLogin.emailInput.click();

    await expect(adminLogin.errorMessage).toHaveText("Password is Required");
  });

  test("LGN 08 : should display error msg for invalid password format", async () => {
    await adminLogin.emailInput.fill("kasun@example.com");
    await adminLogin.passwordInput.fill("test");
    await adminLogin.emailInput.click();

    //verify error msg
    await expect(adminLogin.errorMessage).toHaveText(
      "Password must be longer than or equal to 8 characters",
    );
  });

  test("LGN 09 :Should login successfully with valid credentials", async ({
    page,
  }) => {
    await adminLogin.login("kasun@example.com", "kasun@1234");

    await expect(page).toHaveURL(
      "https://asha-securities-web.innov8hrm.com/dashboard",
    );
  });
});
