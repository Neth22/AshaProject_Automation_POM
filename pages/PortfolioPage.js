import { expect } from "@playwright/test";

export class PortfolioPage {
  constructor(page) {
    this.page = page;

    // PORTFOLIO SUMMARY

    this.totalSecuritiesLabel = page.getByText("Total Securities", {
      exact: true,
    });

    this.totalQuantityLabel = page.getByText("Total Quantity", {
      exact: true,
    });

    this.totalCostLabel = page.getByText("Total Cost (Rs.)", {
      exact: true,
    });

    this.marketValueLabel = page.getByText("Market Value (Rs.)", {
      exact: true,
    });

    this.unrealizedPLLabel = page.getByText("Unrealized P / L", {
      exact: true,
    });

    // PORTFOLIO TABLES

    this.tables = page.getByRole("table");

    // TRANSACTION FILTERS

    this.allFilterBtn = page.getByRole("button", {
      name: /^ALL$/i,
    });

    this.executedFilterBtn = page.getByRole("button", {
      name: /^EXECUTED$/i,
    });

    this.pendingFilterBtn = page.getByRole("button", {
      name: /^PENDING$/i,
    });

    this.cancelledFilterBtn = page.getByRole("button", {
      name: /^CANCELLED$/i,
    });

    // TRANSACTION HISTORY

    this.transactionHistoryHeading = page.getByText(/^Transaction History$/i);

    this.seeMoreBtn = page.getByRole("button", {
      name: /See More/i,
    });

    // Edit Pending Order MODAL

    this.editPendingOrderModal = page
      .getByRole("button", {
        name: "Save Changes",
        exact: true,
      })
      .locator(
        "xpath=ancestor::div[.//p[normalize-space()='Edit Pending Order']][1]",
      );

    this.editQuantityInput = this.editPendingOrderModal.locator("input").nth(0);

    this.editLimitPriceInput = this.editPendingOrderModal
      .locator("input")
      .nth(1);

    this.saveChangesBtn = this.editPendingOrderModal.getByRole("button", {
      name: "Save Changes",
      exact: true,
    });

    this.cancelEditBtn = this.editPendingOrderModal.getByRole("button", {
      name: "Cancel",
      exact: true,
    });

    // DELETE PENDING ORDER MODAL

    // Use the modal heading itself as the modal reference.
    this.deletePendingOrderModal = page
      .getByText("Delete Pending Order", {
        exact: true,
      })
      .locator("xpath=ancestor::div[.//button[normalize-space()='Delete']][1]");

    this.cancelDeleteBtn = this.deletePendingOrderModal.getByRole("button", {
      name: "Cancel",
      exact: true,
    });

    this.confirmDeleteBtn = this.deletePendingOrderModal.getByRole("button", {
      name: "Delete",
      exact: true,
    });
  }

  // PORTFOLIO LOAD

  async verifyPortfolioLoaded() {
    await expect(this.totalSecuritiesLabel).toBeVisible({
      timeout: 15000,
    });

    await expect(this.totalQuantityLabel).toBeVisible({
      timeout: 15000,
    });

    await expect(this.totalCostLabel).toBeVisible({
      timeout: 15000,
    });

    await expect(this.marketValueLabel).toBeVisible({
      timeout: 15000,
    });

    await expect(this.unrealizedPLLabel).toBeVisible({
      timeout: 15000,
    });
  }

  async verifyTransactionHistoryLoaded() {
    await expect(
      this.page.getByText("Transaction History", {
        exact: true,
      }),
    ).toBeVisible({
      timeout: 15000,
    });
  }

  // SUMMARY CARD HELPERS

  async getSummaryCardByLabel(labelRegex) {
    const label = this.page.getByText(labelRegex).first();

    await expect(label).toBeVisible();

    return label.locator("xpath=ancestor::div[1]");
  }

  // HOLDINGS

  async getHoldingRow(symbol) {
    const row = this.page
      .getByRole("row")
      .filter({
        hasText: symbol,
      })
      .first();

    await expect(row).toBeVisible();

    return row;
  }

  async getHoldingData(symbol) {
    const row = this.page
      .getByRole("row")
      .filter({
        hasText: symbol,
      })
      .first();

    await expect(row).toBeVisible();

    const cells = row.locator("td");

    const cellCount = await cells.count();

    const values = [];

    for (let i = 0; i < cellCount; i++) {
      values.push((await cells.nth(i).innerText()).trim());
    }

    return {
      symbol: values[0] ?? "",
      quantity: values[1] ?? "",
      clearedQuantity: values[2] ?? "",
      availableQuantity: values[3] ?? "",
      holdingPercentage: values[4] ?? "",
      averagePrice: values[5] ?? "",
      breakEvenPrice: values[6] ?? "",
      totalCost: values[7] ?? "",
      tradedPrice: values[8] ?? "",
      marketValue: values[9] ?? "",
      unrealizedPL: values[10] ?? "",
    };
  }

  async getHoldingQuantity(symbol) {
    const row = this.page
      .getByRole("row")
      .filter({
        hasText: symbol,
      })
      .first();

    await expect(row).toBeVisible();

    const cells = row.locator("td");

    const cellCount = await cells.count();

    // Quantity is the second column
    return (await cells.nth(1).innerText()).trim();
  }

  async getAllHoldingRows() {
    return this.page.getByRole("row").filter({
      has: this.page.locator("td"),
    });
  }

  // TRANSACTION HISTORY ROW

  async getTransactionRow(symbol) {
    const row = this.page
      .getByRole("row")
      .filter({
        hasText: symbol,
      })
      .filter({
        hasText: /BUY|SELL/i,
      })
      .first();

    await expect(row).toBeVisible();

    return row;
  }

  async getPendingOrderRow(symbol) {
    const row = this.page
      .getByRole("row")
      .filter({
        hasText: symbol,
      })
      .filter({
        hasText: /Pending/i,
      })
      .first();

    await expect(row).toBeVisible();

    return row;
  }

  async getPendingLimitOrderRow(symbol = null) {
    let row = this.page
      .getByRole("row")
      .filter({
        hasText: /Pending/i,
      })
      .filter({
        hasText: /LIMIT/i,
      });

    // If a symbol is provided, filter by that symbol too
    if (symbol) {
      row = row.filter({
        hasText: symbol,
      });
    }

    row = row.first();

    await expect(row).toBeVisible({
      timeout: 15000,
    });

    return row;
  }

  async verifyPendingActions(symbol) {
    const row = await this.getPendingLimitOrderRow(symbol);

    // Verify EDIT action

    await expect(
      row.getByRole("button", {
        name: "EDIT",
      }),
    ).toBeVisible();

    // Verify DELETE action

    await expect(
      row.getByRole("button", {
        name: "DELETE",
      }),
    ).toBeVisible();
  }

  async getTransactionData(symbol) {
    const row = await this.getTransactionRow(symbol);

    const cells = row.locator("td");

    return {
      dateTime: (await cells.nth(0).innerText()).trim(),

      symbol: (await cells.nth(1).innerText()).trim(),

      company: (await cells.nth(2).innerText()).trim(),

      side: (await cells.nth(3).innerText()).trim(),

      quantity: (await cells.nth(4).innerText()).trim(),

      price: (await cells.nth(5).innerText()).trim(),

      orderType: (await cells.nth(6).innerText()).trim(),

      totalValue: (await cells.nth(7).innerText()).trim(),

      status: (
        await row
          .getByText(/Executed|Pending|Cancelled/i)
          .first()
          .innerText()
      ).trim(),
    };
  }

  // FILTERS

  async clickAllFilter() {
    await this.allFilterBtn.click();
  }

  async clickExecutedFilter() {
    await this.executedFilterBtn.click();
  }

  async clickPendingFilter() {
    await this.pendingFilterBtn.click();
  }

  async clickCancelledFilter() {
    await this.cancelledFilterBtn.click();
  }

  async verifyFilterVisible(filterName) {
    const filter = this.page.getByRole("button", {
      name: new RegExp(`^${filterName}$`, "i"),
    });

    await expect(filter).toBeVisible();
  }

  async getVisibleTransactionRows() {
    return this.page.getByRole("row").filter({
      has: this.page.locator("td"),
    });
  }

  // TRANSACTION FILTER

  async selectTransactionFilter(filterName) {
    switch (filterName.toUpperCase()) {
      case "ALL":
        await this.clickAllFilter();
        break;

      case "EXECUTED":
        await this.clickExecutedFilter();
        break;

      case "PENDING":
        await this.clickPendingFilter();
        break;

      case "CANCELLED":
        await this.clickCancelledFilter();
        break;

      default:
        throw new Error(`Unknown transaction filter: ${filterName}`);
    }
  }

  // TRANSACTION STATUS

  async getVisibleTransactionStatuses() {
    const rows = await this.getVisibleTransactionRows();

    const statuses = [];

    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);

      // Ignore table header rows
      if (await row.locator("th").count()) {
        continue;
      }

      const statusLocator = row.getByText(/^(Executed|Pending|Cancelled)$/i);

      if (await statusLocator.count()) {
        const status = (await statusLocator.first().innerText()).trim();

        if (status) {
          statuses.push(status);
        }
      }
    }

    return statuses;
  }

  async verifyRowsHaveStatus(status) {
    const rows = await this.getVisibleTransactionRows();

    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);

      // Ignore table header rows
      if (await row.locator("th").count()) {
        continue;
      }

      await expect(row.getByText(new RegExp(`^${status}$`, "i"))).toBeVisible();
    }
  }

  async verifyFilterContainsOnly(status) {
    const statuses = await this.getVisibleTransactionStatuses();

    for (const actualStatus of statuses) {
      expect(actualStatus.toLowerCase()).toBe(status.toLowerCase());
    }
  }

  // Edit Pending Order

  async openEditPendingOrder(symbol) {
    const row = await this.getPendingLimitOrderRow(symbol);

    const editBtn = row.locator("button").nth(0);

    await expect(editBtn).toBeVisible();

    await editBtn.click();

    await expect(this.saveChangesBtn).toBeVisible({
      timeout: 15000,
    });
  }

  async verifyEditPendingOrderModal(symbol, quantity, limitPrice) {
    await expect(
      this.editPendingOrderModal.getByText("Edit Pending Order", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      this.editPendingOrderModal.getByText(symbol, {
        exact: true,
      }),
    ).toBeVisible();

    const actualQuantity = Number(
      (await this.editQuantityInput.inputValue()).replace(/,/g, ""),
    );

    const actualLimitPrice = Number(
      await this.editLimitPriceInput.inputValue(),
    );

    expect(actualQuantity).toBe(Number(quantity));

    expect(actualLimitPrice).toBe(Number(limitPrice));

    await expect(this.saveChangesBtn).toBeVisible();

    await expect(this.cancelEditBtn).toBeVisible();
  }

  async fillEditPendingOrder(quantity, limitPrice) {
    await this.editQuantityInput.fill(String(quantity));

    await this.editLimitPriceInput.fill(String(limitPrice));
  }

  async savePendingOrderChanges() {
    await this.saveChangesBtn.click();

    await expect(this.editPendingOrderModal).toBeHidden({
      timeout: 15000,
    });
  }

  async cancelPendingOrderEdit() {
    await this.cancelEditBtn.click();

    await expect(this.editPendingOrderModal).toBeHidden({
      timeout: 15000,
    });
  }

  // DELETE PENDING ORDER

  async openDeletePendingOrder(symbol) {
    const row = await this.getPendingOrderRow(symbol);

    const deleteBtn = row.locator("button").nth(1);

    await expect(deleteBtn).toBeVisible();

    await deleteBtn.click();

    await expect(this.deletePendingOrderModal).toBeVisible({
      timeout: 15000,
    });
  }

  async verifyDeletePendingOrderModal(symbol) {
    await expect(this.deletePendingOrderModal).toBeVisible({
      timeout: 15000,
    });

    await expect(
      this.deletePendingOrderModal.getByText("Delete Pending Order", {
        exact: true,
      }),
    ).toBeVisible();

    // Symbol appears twice in the modal.
    // Use the h3 heading to avoid strict mode violation.
    await expect(
      this.deletePendingOrderModal.getByRole("heading", {
        name: symbol,
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      this.deletePendingOrderModal.getByText(
        new RegExp(
          `Are you sure you want to delete this pending order for ${symbol}`,
          "i",
        ),
      ),
    ).toBeVisible();

    await expect(this.cancelDeleteBtn).toBeVisible();

    await expect(this.confirmDeleteBtn).toBeVisible();
  }

  async cancelDeletePendingOrder() {
    await this.cancelDeleteBtn.click();

    await expect(this.deletePendingOrderModal).toBeHidden({
      timeout: 15000,
    });
  }

  async confirmDeletePendingOrder() {
    await this.confirmDeleteBtn.click();

    await expect(this.deletePendingOrderModal).toBeHidden({
      timeout: 15000,
    });
  }
  // Verify final order actions

  async verifyFinalOrderActions(symbol) {
    const row = await this.getTransactionRow(symbol);

    await expect(
      row.getByRole("button", {
        name: "EDIT",
        exact: true,
      }),
    ).toHaveCount(0);

    await expect(
      row.getByRole("button", {
        name: "DELETE",
        exact: true,
      }),
    ).toHaveCount(0);
  }

  // PORTFOLIO LOAD

  async refresh() {
    await this.page.reload();
  }

  async verifyPortfolioLoaded() {
    await expect(this.totalSecuritiesLabel).toBeVisible({
      timeout: 15000,
    });

    await expect(this.totalQuantityLabel).toBeVisible({
      timeout: 15000,
    });

    await expect(this.totalCostLabel).toBeVisible({
      timeout: 15000,
    });

    await expect(this.marketValueLabel).toBeVisible({
      timeout: 15000,
    });

    await expect(this.unrealizedPLLabel).toBeVisible({
      timeout: 15000,
    });
  }

  // SEE MORE

  async isSeeMoreVisible() {
    return await this.seeMoreBtn.isVisible();
  }

  async clickSeeMore() {
    await expect(this.seeMoreBtn).toBeVisible();

    await this.seeMoreBtn.click();
  }
}
