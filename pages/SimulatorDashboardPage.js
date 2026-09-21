import { expect } from "@playwright/test";

export class SimulatorDashboardPage {
  constructor(page) {
    this.page = page;

    //simulator dashboard url
    this.dashboardUrl =
      "https://asha-securities-web.innov8hrm.com/simulator/simulatorDashboard";

    //Header btns
    this.ordersBtn = page.getByText("Orders", { exact: true });

    this.clientBtn = page.getByText("Client", { exact: true });

    this.openCseAccountBtn = page.getByText("Open CSE Account", {
      exact: true,
    });

    this.leaderboardBtn = page.getByRole("button", {
      name: "Leaderboard",
    });

    this.userGuideBtn = page.getByRole("button", {
      name: "User Guide",
    });

    this.portfolioBtn = page.getByRole("button", {
      name: "PORTFOLIO",
    });

    //Search bar
    this.searchInput = page.getByPlaceholder("Search here....");

    //market data table
    this.marketRows = page.locator("tbody tr");

    //orders menu

    this.marketDepthMenu = page.getByRole("button", { name: "Market Depth" });

    this.buyMenu = page.getByRole("button", { name: "Buy" });

    this.sellMenu = page.getByRole("button", { name: "Sell" });
  }

  async verifyDashboardUrl() {
    await expect(this.page).toHaveURL(this.dashboardUrl);
  }
  async verifyDashboard() {
    await expect(this.openCseAccountBtn).toBeVisible();
    await expect(this.leaderboardBtn).toBeVisible();
    await expect(this.userGuideBtn).toBeVisible();
    await expect(this.portfolioBtn).toBeVisible();
    await expect(this.searchInput).toBeVisible();
  }

  async search(searchText) {
    await this.searchInput.fill(searchText);
  }

  async clearSearch() {
    await this.searchInput.fill("");
  }

  async clickOrders() {
    await this.ordersBtn.click();
  }

  async clickClient() {
    await this.clientBtn.click();
  }

  async clickPortfolio() {
    await this.portfolioBtn.click();
  }

  async clickLeaderboard() {
    await this.leaderboardBtn.click();
  }

  async clickUserGuide() {
    await this.userGuideBtn.click();
  }

  async clickOpenCseAccount() {
    await this.openCseAccountBtn.click();
  }

  async clickMarketDepth() {
    await this.ordersBtn.click();
    await this.marketDepthMenu.click();
  }

  async clickBuy() {
    await this.ordersBtn.click();
    await this.buyMenu.click();
  }

  async clickSell() {
    await this.ordersBtn.click();
    await this.sellMenu.click();
  }

  // select security and order menu (right click)
  async selectSecurity(security) {
    await this.page.getByText(security, { exact: true }).click();
  }

  async rightClickSecurity(security) {
    await this.page.getByText(security, { exact: true }).click({
      button: "right",
    });
  }
}
