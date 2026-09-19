import test from "@playwright/test";
import { SimulatorRegisterPage } from "../pages/SimulatorRegisterPage.js";

test.describe("Simulator Register Test Cases", () => {
    let simulatorRegister;

    test.beforeEach(async ({ page }) => {
        simulatorRegister = new SimulatorRegisterPage(page);
        await simulatorRegister.goto();
    });

    test("SRGN_01: Should display all initial UI elements correctly", async () => {
        await simulatorRegister.verifyRegisterPage();
    });
    










});

