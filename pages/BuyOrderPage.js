import { expect } from "@playwright/test";
import { toNumber } from "../utils/marketDataHelper.js";

export class SimulatorBuyOrderPage {
  constructor(page) {
    this.page = page;

    /*
     * =========================================================
     * BUY MODAL
     * =========================================================
     */

    this.modal = page
      .locator("aside:visible")
      .filter({
        has: page.getByText(/^[A-Z0-9.]+\s+BUY$/i),
      })
      .first();

    /*
     * =========================================================
     * ACTION
     * =========================================================
     */

    this.buyActionButton = this.modal.getByRole("button", {
      name: "BUY",
      exact: true,
    }).first();

    this.sellActionButton = this.modal.getByRole("button", {
      name: "SELL",
      exact: true,
    }).first();

    /*
     * =========================================================
     * QUANTITY
     * =========================================================
     */

    this.quantityInput = this.modal
      .locator("label")
      .filter({
        hasText: /^Quantity/i,
      })
      .locator("..")
      .locator('input[type="number"]');

    /*
     * =========================================================
     * PRICE
     * =========================================================
     */

    this.priceInput = this.modal
      .locator("label")
      .filter({
        hasText: /^Price/i,
      })
      .locator("..")
      .locator('input[type="number"]');

    /*
     * =========================================================
     * ORDER TYPE
     * =========================================================
     */

    this.orderTypeSelect = this.modal
      .locator("label")
      .filter({
        hasText: /^Order Type/i,
      })
      .locator("..")
      .locator("select");

    /*
     * =========================================================
     * BROKER CLIENT
     * =========================================================
     */

    this.clientSelect = this.modal
      .locator("label")
      .filter({
        hasText: /^Broker-Client/i,
      })
      .locator("..")
      .locator("select");

    /*
     * =========================================================
     * CONFIRM
     * =========================================================
     */

    this.confirmCheckbox = this.modal.locator(
      'input[type="checkbox"]',
    );

    /*
     * =========================================================
     * FOOTER BUTTONS
     * =========================================================
     */

    this.submitBuyButton = this.modal.getByRole("button", {
      name: "BUY",
      exact: true,
    }).last();

    this.closeButton = this.modal.getByRole("button", {
      name: "CLOSE",
      exact: true,
    });

    /*
     * =========================================================
     * MARKET SUMMARY
     * =========================================================
     */

    this.marketSummaryLabels = [
      "Best Bid",
      "Best Ask",
      "Net Change",
      "Avg Price",
      "Last Trade",
      "# Trades",
      "High",
      "Low",
      "Turnover",
      "Volume",
    ];

    /*
     * =========================================================
     * ORDER BOOK
     * =========================================================
     */

    this.bidPriceHeader = this.modal.getByText("Bid Price", {
      exact: true,
    });

    this.bidQtyHeader = this.modal.getByText("Bid Qty", {
      exact: true,
    });

    this.askPriceHeader = this.modal.getByText("Ask Price", {
      exact: true,
    });

    this.askQtyHeader = this.modal.getByText("Ask Qty", {
      exact: true,
    });
  }

  /*
   * =========================================================
   * MODAL
   * =========================================================
   */

  async verifyModalVisible() {
    await expect(this.modal).toBeVisible();
  }

  async verifySelectedSecurity(symbol) {
    await expect(
      this.modal.getByText(
        new RegExp(`^${escapeRegex(symbol)}\\s+BUY$`, "i"),
      ),
    ).toBeVisible();
  }

  /*
   * =========================================================
   * QUANTITY
   * =========================================================
   */

  async getQuantity() {
    await expect(this.quantityInput).toBeVisible();

    return await this.quantityInput.inputValue();
  }

  async enterQuantity(quantity) {
    await this.quantityInput.fill(String(quantity));
  }

  async clearQuantity() {
    await this.quantityInput.fill("");
  }

  async isQuantityEditable() {
    return await this.quantityInput.isEditable();
  }

  /*
   * =========================================================
   * PRICE
   * =========================================================
   */

  async getPrice() {
    await expect(this.priceInput).toBeVisible();

    const value = await this.priceInput.inputValue();

    if (!value || value.trim() === "") {
      throw new Error("Price input is empty.");
    }

    return value.trim();
  }

  async getPriceNumber() {
    const priceText = await this.getPrice();

    const price = Number(
      priceText.replace(/,/g, "").trim(),
    );

    if (Number.isNaN(price)) {
      throw new Error(
        `Invalid displayed price: "${priceText}"`,
      );
    }

    return price;
  }

  async enterPrice(price) {
    await this.priceInput.fill(String(price));
  }

  async clearPrice() {
    await this.priceInput.fill("");
  }

  async isPriceEditable() {
    return await this.priceInput.isEditable();
  }

  /*
   * =========================================================
   * ORDER TYPE
   * =========================================================
   */

  async selectOrderType(type) {
    await expect(this.orderTypeSelect).toBeVisible();

    await this.orderTypeSelect.selectOption({
      label: type.toUpperCase(),
    });
  }

  async getSelectedOrderType() {
    await expect(this.orderTypeSelect).toBeVisible();

    return await this.orderTypeSelect.inputValue();
  }

  async verifyOrderType(type) {
    await expect(this.orderTypeSelect).toHaveValue(type);
  }

  /*
   * =========================================================
   * BROKER CLIENT
   * =========================================================
   */

  async openClientDropdown() {
    await expect(this.clientSelect).toBeVisible();

    await this.clientSelect.click();
  }

  async selectClient(clientName) {
    await expect(this.clientSelect).toBeVisible();

    await this.clientSelect.selectOption({
      label: clientName,
    });
  }

  async getSelectedClient() {
    await expect(this.clientSelect).toBeVisible();

    return await this.clientSelect.inputValue();
  }

  /*
   * =========================================================
   * CONFIRM
   * =========================================================
   */

  async checkConfirm() {
    await expect(this.confirmCheckbox).toBeVisible();

    if (!(await this.confirmCheckbox.isChecked())) {
      await this.confirmCheckbox.check();
    }
  }

  async uncheckConfirm() {
    await expect(this.confirmCheckbox).toBeVisible();

    if (await this.confirmCheckbox.isChecked()) {
      await this.confirmCheckbox.uncheck();
    }
  }

  async isConfirmChecked() {
    return await this.confirmCheckbox.isChecked();
  }

  /*
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  async submitBuy() {
    await expect(this.submitBuyButton).toBeVisible();

    await this.submitBuyButton.click();
  }

  async isBuyButtonDisabled() {
    return await this.submitBuyButton.isDisabled();
  }

  /*
   * =========================================================
   * CALCULATIONS
   * =========================================================
   */

  async getCalculationValue(label) {
    const labelLocator = this.modal
      .getByText(label, {
        exact: true,
      })
      .last();

    await expect(labelLocator).toBeVisible();

    const parent = labelLocator.locator("..");

    const text = await parent.innerText();

    const matches = text.match(
      /-?\d[\d,]*(?:\.\d+)?/g,
    );

    if (!matches?.length) {
      return null;
    }

    return toNumber(
      matches[matches.length - 1],
    );
  }

  async getOrderValue() {
    return await this.getCalculationValue(
      "Order Value",
    );
  }

  async getCommission() {
    return await this.getCalculationValue(
      "Commission",
    );
  }

  async getNetValue() {
    return await this.getCalculationValue(
      "Net Value",
    );
  }

  async getBuyingPower() {
    return await this.getCalculationValue(
      "Buying Power",
    );
  }

  async getAvailableQty() {
    return await this.getCalculationValue(
      "Available Qty",
    );
  }

  async getPendingBuyQty() {
    return await this.getCalculationValue(
      "Pending Buy Qty",
    );
  }

  /*
   * =========================================================
   * MARKET SUMMARY
   * =========================================================
   */

  async getMarketSummaryValue(label) {
    const labelLocator = this.modal
      .getByText(label, {
        exact: true,
      })
      .first();

    await expect(labelLocator).toBeVisible();

    const parent = labelLocator.locator("..");

    const text = await parent.innerText();

    return text.trim();
  }

  async verifyMarketSummaryVisible() {
    await expect(this.modal).toBeVisible();

    for (const label of this.marketSummaryLabels) {
      await expect(
        this.modal.getByText(label, {
          exact: true,
        }).first(),
      ).toBeVisible();
    }
  }

  /*
   * =========================================================
   * ORDER BOOK
   * =========================================================
   */

  async verifyOrderBookVisible() {
    await expect(
      this.bidPriceHeader,
    ).toBeVisible();

    await expect(
      this.bidQtyHeader,
    ).toBeVisible();

    await expect(
      this.askPriceHeader,
    ).toBeVisible();

    await expect(
      this.askQtyHeader,
    ).toBeVisible();
  }

  /*
   * =========================================================
   * VALIDATION MESSAGE
   * =========================================================
   */

  async expectValidationMessage(pattern) {
    await expect(
      this.modal.getByText(pattern).last(),
    ).toBeVisible();
  }

  /*
   * =========================================================
   * CLOSE
   * =========================================================
   */

  async close() {
    await expect(this.closeButton).toBeVisible();

    await this.closeButton.click();

    await expect(this.modal).toBeHidden();
  }
}

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}