import { LitElement, html, customElement, property } from "lit-element";
import { TemplateResult } from "lit-html";

@customElement("sitna-pdf-pagination")
export default class PdfPagination extends LitElement {
  @property({ type: Number })
  currentPage = 0;

  @property({ type: Number })
  totalPages = 0;

  @property({ attribute: false, type: Function })
  toChangePage = (_n: number): void => {};

  @property({ type: Number })
  step = 1;

  render(): TemplateResult {
    return html`
      <div>
        <button @click="${this.handlePrevPage}" ?disabled="${this.currentPage <= 1}">&lt;</button>
        <input
          .value="${this.currentPage}"
          @change="${this.handleCurrentPageChange}"
        />&nbsp;/&nbsp;<span>${this.totalPages}</span>
        <button @click="${this.handleNextPage}" ?disabled="${this.currentPage >= this.totalPages}">
          &gt;
        </button>
      </div>
    `;
  }

  handleNextPage(): void {
    this.toChangePage(this.currentPage + this.step);
  }

  handlePrevPage(): void {
    this.toChangePage(this.currentPage - this.step);
  }

  handleCurrentPageChange(ev: InputEvent): void {
    const page = parseInt((ev.target as HTMLInputElement).value);
    if (!isNaN(page)) {
      this.toChangePage(page);
    }
  }
}
