import {
  LitElement,
  property,
  html,
  TemplateResult,
  customElement,
  css,
  CSSResult,
} from "lit-element";
import { storage, StorageState } from "sitna/utils";
import { boundMethod } from "autobind-decorator";

@customElement("sitna-storage-tracker")
export default class StorageTracker extends LitElement {
  @property()
  state = StorageState.Unknown;

  @property()
  quota = null;

  static get styles(): CSSResult {
    return css`
      :host {
        min-height: 16px;
        display: inline-block;
      }

      .progress-bar {
        display: inline-block;
        position: relative;
        height: auto;
        width: 150px;
        background: grey;
        text-align: center;
      }

      .progress-bar::after {
        display: inline-block;
        position: absolute;
        left: 100%;
      }

      .progress-bar-inner {
        height: 100%;
        position: absolute;
        background: green;
        top: 0;
        left: 0;
        z-index: 0;
      }

      .progress-bar label {
        z-index: 10;
        display: relative;
        opacity: 0.99;
      }
    `;
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this.updateStorage();
    document.addEventListener("sitna-storage-change", this.updateStorage);
  }

  @boundMethod
  private async updateStorage(): Promise<void> {
    this.state = await storage.state();
    this.quota = await storage.estimate();
  }

  render(): TemplateResult {
    let value = null;
    let max = null;
    const state = this.state.toString();

    if (this.quota) {
      value = this.quota.usage;
      max = this.quota.quota;
    }

    return html`
      Browser Storage:
      <div class="progress-bar ${state}">
        ${this.quota
          ? html`
              <div class="progress-bar-inner" style="width: ${(value / max) * 100}%"></div>
            `
          : null}
        <label>${this.formatValue(value)} / ${this.formatValue(max)}</label>
      </div>
    `;
  }

  formatValue(value: number | null): string {
    if (value == null) {
      return "?";
    }
    const units = ["B", "KB", "MB", "GB", "TB"];
    for (const unit of units) {
      if (value < 1024) {
        return `${value}${unit}`;
      }
      value = Math.round(value / 1024);
    }
    return `${value}${units[units.length - 1]}`;
  }
}
