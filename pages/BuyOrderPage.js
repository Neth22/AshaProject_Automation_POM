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

    this.modal = page.getByText(/^[A-Z0-9.]+\s+BUY$/i).first();

    /*
     * =========================================================
     * ACTION
     * =========================================================
     */

    this.buyActionButton = page
      .getByRole("button", {
        name: "BUY",
        exact: true,
      })
      .first();

    this.sellActionButton = page
      .getByRole("button", {
        name: "SELL",
        exact: true,
      })
      .first();

    /*
     * =========================================================
     * QUANTITY
     * =========================================================
     */

    this.quantityLabel = page.getByText("QUANTITY", {
      exact: true,
    });

    this.quantityContainer = this.quantityLabel.locator("..");

    this.quantityInput = this.quantityContainer.locator("input").first();

    /*
     * =========================================================
     * PRICE
     * =========================================================
     */

    this.priceLabel = page.getByText("PRICE", {
      exact: true,
    });

    this.priceContainer = this.priceLabel.locator("..");

    this.priceInput = this.priceContainer.locator("input").first();

    /*
     * =========================================================
     * ORDER TYPE
     * =========================================================
     */

    this.orderTypeLabel = page.getByText("ORDER TYPE", {
      exact: true,
    });

    this.orderTypeContainer = this.orderTypeLabel.locator("..");

    this.orderTypeButton = this.orderTypeContainer.getByRole("button").first();

    /*
     * =========================================================
     * BROKER CLIENT
     * =========================================================
     */

    this.clientLabel = page.getByText("BROKER-CLIENT", {
      exact: true,
    });

    this.clientContainer = this.clientLabel.locator("..");

    this.clientButton = this.clientContainer.getByRole("button").first();

    /*
     * =========================================================
     * CONFIRM
     * =========================================================
     */

    this.confirmCheckbox = page.locator('input[type="checkbox"]').last();

    /*
     * =========================================================
     * FOOTER BUTTONS
     * =========================================================
     */

    this.submitBuyButton = page
      .getByRole("button", {
        name: "BUY",
        exact: true,
      })
      .last();

    this.closeButton = page
      .getByRole("button", {
        name: /close/i,
      })
      .last();

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

    this.orderBookHeader = page.getByText(
      /BID\s*--\s*BID QTY|ASK\s*--\s*ASK QTY/i,
    );
  }

  /*
   * =========================================================
   * MODAL
   * =========================================================
   */

  async verifyModalVisible() {
    await expect(
      this.page.getByText(/[A-Z0-9.]+\s+BUY/i).first(),
    ).toBeVisible();
  }

  async verifySelectedSecurity(symbol) {
    await expect(
      this.page.getByText(new RegExp(`^${escapeRegex(symbol)}\\s+BUY$`, "i")),
    ).toBeVisible();
  }

  /*
   * =========================================================
   * QUANTITY
   * =========================================================
   */

  async getQuantity() {
    return await this.quantityInput.inputValue();
  }

  async enterQuantity(quantity) {
    await this.quantityInput.fill(String(quantity));
  }

  async clearQuantity() {
    await this.quantityInput.fill("");
  }

  /*
   * =========================================================
   * PRICE
   * =========================================================
   */

  async getPrice() {
    return await this.priceInput.inputValue();
  }

  async getPriceNumber() {
    return toNumber(await this.getPrice());
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
    await this.orderTypeButton.click();

    await this.page
      .getByText(type, {
        exact: true,
      })
      .last()
      .click();
  }

  async verifyOrderType(type) {
    await expect(
      this.page
        .getByText(type, {
          exact: true,
        })
        .first(),
    ).toBeVisible();
  }

  /*
   * =========================================================
   * CLIENT
   * =========================================================
   */

  async openClientDropdown() {
    await this.clientButton.click();
  }

  async selectClient(clientName) {
    await this.openClientDropdown();

    await this.page
      .getByText(clientName, {
        exact: true,
      })
      .last()
      .click();
  }

  async getSelectedClient() {
    return (await this.clientButton.innerText()).trim();
  }

  /*
   * =========================================================
   * CONFIRM
   * =========================================================
   */

  async checkConfirm() {
    if (!(await this.confirmCheckbox.isChecked())) {
      await this.confirmCheckbox.check();
    }
  }

  async uncheckConfirm() {
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
    const labelLocator = this.page
      .getByText(label, {
        exact: true,
      })
      .last();

    const parent = labelLocator.locator("..");

    const text = await parent.innerText();

    /*
     * Extract the final numeric value.
     */
    const matches = text.match(/-?\d[\d,]*(?:\.\d+)?/g);

    if (!matches?.length) {
      return null;
    }

    return toNumber(matches[matches.length - 1]);
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

  async getBuyingPower() {
    return await this.getCalculationValue("Buying Power");
  }

  async getAvailableQty() {
    return await this.getCalculationValue("Available Qty");
  }

  async getPendingBuyQty() {
    return await this.getCalculationValue("Pending Buy Qty");
  }

  /*
   * =========================================================
   * MARKET SUMMARY
   * =========================================================
   */

  async getMarketSummaryValue(label) {
    const labelLocator = this.page
      .getByText(label, {
        exact: true,
      })
      .first();

    const parent = labelLocator.locator("..");

    const text = await parent.innerText();

    return text.trim();
  }

  async verifyMarketSummaryVisible() {
    for (const label of this.marketSummaryLabels) {
      await expect(
        this.page
          .getByText(label, {
            exact: true,
          })
          .first(),
      ).toBeVisible();
    }
  }

  /*
   * =========================================================
   * ORDER BOOK
   * =========================================================
   */

  async verifyOrderBookVisible() {
    await expect(this.page.getByText(/BID\s*--\s*BID QTY/i)).toBeVisible();

    await expect(this.page.getByText(/ASK\s*--\s*ASK QTY/i)).toBeVisible();
  }

  /*
   * =========================================================
   * VALIDATION MESSAGE
   * =========================================================
   */

  async expectValidationMessage(pattern) {
    await expect(this.page.getByText(pattern).last()).toBeVisible();
  }

  /*
   * =========================================================
   * CLOSE
   * =========================================================
   */

  async close() {
    await this.closeButton.click();
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
