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

    //profile
    this.profileBtn = (userName) =>
      page.getByRole("button", { name: userName });

    this.profilePanel = (userName) =>
      this.profileBtn(userName).locator("xpath=following-sibling::div[1]");

    this.profileLogoutBtn = (userName) =>
      this.profilePanel(userName).getByRole("button", {
        name: /Log Out/i,
      });
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

  //profile details
  async clickProfile(userName) {
    await this.profileBtn(userName).click();
  }

  async clickLogout(userName) {
    await this.profileLogoutBtn(userName).click();
  }

  async verifyProfileDetails(userName, clientId, email, joinedDate) {
    const profilePanel = this.profilePanel(userName);

    await expect(
      profilePanel.getByText(userName, {
        exact: true,
      }),
    ).toBeVisible();

    await expect(profilePanel.getByText(/Client ID:/)).toBeVisible();

    await expect(profilePanel.getByText(new RegExp(clientId))).toBeVisible();

    await expect(
      profilePanel.getByText(email, {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      profilePanel.getByText(joinedDate, {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      profilePanel.getByRole("button", {
        name: "Log Out",
      }),
    ).toBeVisible();
  }

  // select security and order menu (right click)
  async selectSecurity(security) {
    await this.page.getByText(security, { exact: true }).click();
  }

  async rightClickSecurity(security) {
    await this.page
      .getByRole("table")
      .getByText(security, { exact: true })
      .click({ button: "right" });
  }

  async openBuyForSecurity(security) {
    // Right-click the requested stock.
    await this.rightClickSecurity(security);

    // Context menu Buy button.
    const buyButton = this.page.getByRole("button", {
      name: "Buy",
      exact: true,
    });

    await expect(buyButton).toBeVisible();

    // Open Buy modal.
    await buyButton.click();
  }

  async rightClickSecurity(security) {
    await this.page
      .getByRole("table")
      .getByText(security, { exact: true })
      .click({
        button: "right",
      });
  }

  async openBuyForSecurity(security) {
    await this.rightClickSecurity(security);

    const buyButton = this.page.getByRole("button", {
      name: "Buy",
      exact: true,
    });

    await expect(buyButton).toBeVisible();

    await buyButton.click();
  }

  async openSellForSecurity(symbol) {
    await this.rightClickSecurity(symbol);

    const sellButton = this.page.getByRole("button", {
      name: "Sell",
      exact: true,
    });

    await expect(sellButton).toBeVisible();

    await sellButton.click();
  }

  async getSecurityRow(security) {
    return this.page
      .getByRole("table")
      .getByRole("row")
      .filter({
        hasText: security,
      })
      .first();
  }

  async getSecurityData(security) {
    const row = await this.getSecurityRow(security);

    await expect(row).toBeVisible();

    return {
      security: await row.locator("td").nth(0).innerText(),
      company: await row.locator("td").nth(1).innerText(),
      bidQty: await row.locator("td").nth(2).innerText(),
      bidPrice: await row.locator("td").nth(3).innerText(),
      askPrice: await row.locator("td").nth(4).innerText(),
      askQty: await row.locator("td").nth(5).innerText(),
      last: await row.locator("td").nth(6).innerText(),
      lastQty: await row.locator("td").nth(7).innerText(),
      change: await row.locator("td").nth(8).innerText(),
      high: await row.locator("td").nth(9).innerText(),
      low: await row.locator("td").nth(10).innerText(),
      volume: await row.locator("td").nth(11).innerText(),
      turnover: await row.locator("td").nth(12).innerText(),
      trades: await row.locator("td").nth(13).innerText(),
      close: await row.locator("td").nth(14).innerText(),
    };
  }
}
