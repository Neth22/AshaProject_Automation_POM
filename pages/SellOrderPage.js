import { expect } from "@playwright/test";

export class SimulatorSellOrderPage {
  constructor(page) {
    this.page = page;

    // ========================================================
    // MODAL
    // ========================================================

    this.modal = page
      .locator("aside:visible")
      .filter({
        hasText: /SELL/i,
      })
      .last();

    // ========================================================
    // MODAL HEADER
    // ========================================================

    this.closeButton = this.modal.getByRole("button", {
      name: /close/i,
    });

    // ========================================================
    // ORDER FIELDS
    // ========================================================

    this.quantityInput = this.modal
      .getByRole("textbox")
      .filter({
        has: this.page.locator("input"),
      })
      .first();

    this.priceInput = this.modal.locator("input").nth(1);

    // More reliable fallback locators
    this.inputs = this.modal.locator("input");

    // ========================================================
    // ACTION
    // ========================================================

    this.buyActionButton = this.modal.getByText("BUY", {
      exact: true,
    });

    this.sellActionButton = this.modal.getByText("SELL", {
      exact: true,
    });

    // ========================================================
    // ORDER TYPE
    // ========================================================

    this.orderTypeControl = this.modal
      .getByText("LIMIT", {
        exact: true,
      })
      .or(
        this.modal.getByText("MARKET", {
          exact: true,
        }),
      )
      .first();

    // ========================================================
    // CONFIRM
    // ========================================================

    this.confirmCheckbox = this.modal.locator('input[type="checkbox"]');

    // ========================================================
    // SUBMIT
    // ========================================================

    this.submitSellButton = this.modal.getByRole("button", {
      name: "SELL",
      exact: true,
    });

    this.closeSellButton = this.modal.getByRole("button", {
      name: "CLOSE",
      exact: true,
    });
  }

  // ==========================================================
  // MODAL
  // ==========================================================

  async verifyModalVisible() {
    await expect(this.modal).toBeVisible();
  }

  async verifySelectedSecurity(symbol) {
    await expect(
      this.modal.getByText(new RegExp(`^${symbol}\\s+SELL$`, "i")),
    ).toBeVisible();
  }

  // ==========================================================
  // MARKET SUMMARY
  // ==========================================================

  async verifyMarketSummaryVisible() {
    await expect(
      this.modal.getByText("Best Bid", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      this.modal.getByText("Best Ask", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      this.modal.getByText("Net Change", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      this.modal.getByText("Last Trade", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      this.modal.getByText("High", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      this.modal.getByText("Low", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      this.modal.getByText("Turnover", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      this.modal.getByText("Volume", {
        exact: true,
      }),
    ).toBeVisible();
  }

  // ==========================================================
  // ORDER BOOK
  // ==========================================================

  async verifyOrderBookData(orderBook) {
    await expect(this.modal).toBeVisible();

    const modalText = await this.modal.innerText();

    expect(modalText).toMatch(/BID\s+PRICE/i);
    expect(modalText).toMatch(/BID\s+QTY/i);
    expect(modalText).toMatch(/ASK\s+PRICE/i);
    expect(modalText).toMatch(/ASK\s+QTY/i);
    expect(modalText).toMatch(/SPLITS/i);

    const bids = orderBook.data.bids;
    const asks = orderBook.data.asks;

    expect(bids).toBeDefined();
    expect(asks).toBeDefined();

    expect(bids.length).toBeGreaterThan(0);
    expect(asks.length).toBeGreaterThan(0);

    // Validate visible rows only
    const visibleBidRows = Math.min(3, bids.length);
    const visibleAskRows = Math.min(3, asks.length);

    for (let i = 0; i < visibleBidRows; i++) {
      const bid = bids[i];

      const price = Number(bid.price).toFixed(2);
      const quantity = Number(bid.quantity).toLocaleString("en-US");

      expect(modalText).toContain(price);
      expect(modalText).toContain(quantity);
    }

    for (let i = 0; i < visibleAskRows; i++) {
      const ask = asks[i];

      const price = Number(ask.price).toFixed(2);
      const quantity = Number(ask.quantity).toLocaleString("en-US");

      expect(modalText).toContain(price);
      expect(modalText).toContain(quantity);
    }
  }
  // ==========================================================
  // CLIENT
  // ==========================================================

  async getSelectedClient() {
    const text = await this.modal
      .locator("input")
      .evaluateAll((inputs) =>
        inputs
          .map((input) => input.value)
          .find((value) => value && value.trim() !== ""),
      );

    return text || "";
  }

  // ==========================================================
  // ACTION
  // ==========================================================

  async selectSellAction() {
    await this.sellActionButton.click();
  }

  async selectBuyAction() {
    await this.buyActionButton.click();
  }

  // ==========================================================
  // ORDER TYPE
  // ==========================================================

  async selectOrderType(orderType) {
    const normalized = orderType.toUpperCase();

    const current = this.modal.getByText(normalized, {
      exact: true,
    });

    await current.click();

    const option = this.page
      .getByText(normalized, {
        exact: true,
      })
      .last();

    if (await option.isVisible().catch(() => false)) {
      await option.click();
    }
  }

  async verifyOrderType(expected) {
    await expect(
      this.modal.getByText(expected.toUpperCase(), {
        exact: true,
      }),
    ).toBeVisible();
  }

  // ==========================================================
  // QUANTITY
  // ==========================================================

  async enterQuantity(quantity) {
    const input = this.inputs.nth(0);

    await input.fill(String(quantity));
  }

  async clearQuantity() {
    const input = this.inputs.nth(0);

    await input.fill("");
  }

  async getQuantity() {
    return await this.inputs.nth(0).inputValue();
  }

  // ==========================================================
  // PRICE
  // ==========================================================

  async enterPrice(price) {
    await this.inputs.nth(1).fill(String(price));
  }

  async getPrice() {
    return await this.inputs.nth(1).inputValue();
  }

  async getPriceNumber() {
    const value = await this.getPrice();

    const number = Number(String(value).replace(/,/g, ""));

    return number;
  }

  // ==========================================================
  // CALCULATIONS
  // ==========================================================

  async getCalculationValue(label) {
    const labelLocator = this.modal.getByText(label, {
      exact: true,
    });

    const container = labelLocator.locator("xpath=..");

    const text = await container.innerText();

    const match = text.match(/(-?\d[\d,]*(?:\.\d+)?)/);

    if (!match) {
      return 0;
    }

    return Number(match[1].replace(/,/g, ""));
  }

  async getOrderValue() {
    return await this.getCalculationValue("Order Value");
  }

  async getCommission() {
    return await this.getCalculationValue("Commission");
  }

  async getNetValue() {
    return await this.getCalculationValue("Net Value");
  }

  async getAvailableQuantity() {
    return await this.getCalculationValue("Available Qty");
  }

  // ==========================================================
  // CONFIRM
  // ==========================================================

  async checkConfirm() {
    if (!(await this.isConfirmChecked())) {
      await this.confirmCheckbox.check();
    }
  }

  async uncheckConfirm() {
    if (await this.isConfirmChecked()) {
      await this.confirmCheckbox.uncheck();
    }
  }

  async isConfirmChecked() {
    return await this.confirmCheckbox.isChecked();
  }

  // ==========================================================
  // SUBMIT
  // ==========================================================

  async submitSell() {
    await this.submitSellButton.click();
  }

  // ==========================================================
  // CLOSE
  // ==========================================================

  async close() {
    await this.closeSellButton.click();
  }
}
