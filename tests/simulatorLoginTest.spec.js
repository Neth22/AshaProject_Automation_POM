import test, { expect } from "@playwright/test";
import { SimulatorLogin } from "../pages/SimulatorLoginPage.js";

test.describe("Simulator Login Test Cases", () => {
  let simulatorLogin;

  test.beforeEach(async ({ page }) => {
    simulatorLogin = new SimulatorLogin(page);
    await simulatorLogin.goto();
  });

  test("SLGN_01: Should display all initial UI elements correctly", async () => {
    await simulatorLogin.verifyLoginPage();
  });

  test("SLGN 02 : Should toggle password visibility when clicking eye icon", async () => {
    await simulatorLogin.typePassword("simulator@1234");

    await expect(simulatorLogin.passwordInput).toHaveAttribute(
      "type",
      "password",
    );

    await simulatorLogin.showPassword.click();

    await simulatorLogin.hidePassword.click();
  });

  test("SLGN 03 : Should display error message for invalid email", async () => {
    await simulatorLogin.login("simulator@example.com", "nuhansa@1234");
    //verify error msg
    await expect(simulatorLogin.errorMessage).toHaveText(
      "Invalid username/email or password",
    );
  });

  test("SLGN 04 : Should display error message for invalid password", async () => {
    await simulatorLogin.login("nseneviratne44@gmail.com", "heshani@1234");

    //verify error msg
    await expect(simulatorLogin.errorMessage).toHaveText(
      "Invalid username/email or password",
    );
  });

  test("SLGN 05 : should display error msg for invalid email format", async () => {
    await simulatorLogin.emailInput.fill("test");

    await simulatorLogin.passwordInput.click();
    //verify error msg
    await expect(simulatorLogin.errorMessage).toHaveText(
      "Please enter a valid email address.",
    );
  });

  test("SLGN 06 :email field should be required", async () => {
    await simulatorLogin.emailInput.fill(" ");
    await simulatorLogin.passwordInput.fill("nuhansa@1234");
    await simulatorLogin.passwordInput.click();

    await expect(simulatorLogin.errorMessage).toHaveText("Email is required.");
  });

  test("SLGN 07 :password field should be required", async () => {
    await simulatorLogin.passwordInput.fill("");
    await simulatorLogin.emailInput.fill("nseneviratne44@gmail.com");
    await simulatorLogin.emailInput.click();

    await expect(simulatorLogin.errorMessage).toHaveText(
      "Password is Required",
    );
  });

  test("SLGN 08 : should display error msg for invalid password format", async () => {
    await simulatorLogin.emailInput.fill("nseneviratne44@gmail.com");
    await simulatorLogin.passwordInput.fill("te1");
    await simulatorLogin.emailInput.click();

    //verify error msg
    await expect(simulatorLogin.errorMessage).toHaveText(
      "Password must be longer than or equal to 8 characters",
    );
  });

  test("SLGN 09: should redirect to forgot password page", async () => {
    await simulatorLogin.clcikForgotPassword();

    await expect(simulatorLogin.page).toHaveURL(
      "https://asha-securities-web.innov8hrm.com/simulator/forgot-password",
    );
  });

  test("SLGN 10 :Should login successfully with valid credentials", async ({
    page,
  }) => {
    await simulatorLogin.login("nseneviratne44@gmail.com", "nuhansa@1234");

    await expect(page).toHaveURL(
      "https://asha-securities-web.innov8hrm.com/simulator/simulatorDashboard",
    );
  });
});
