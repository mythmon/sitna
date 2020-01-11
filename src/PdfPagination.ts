import { boundMethod } from "autobind-decorator";
import { LitElement, html, customElement, property } from "lit-element";
import { TemplateResult } from "lit-html";

import PdfViewer from "sitna/PdfViewer";

@customElement("sitna-pdf-pagination")
export default class PdfPagination extends LitElement {
  _pdfViewer: PdfViewer | null;

  @property({ type: Number })
  currentPage = 0;

  @property({ type: Number })
  totalPages = 0;

  render(): TemplateResult {
    return html`
      <div>
        <button @click="${this.handlePrevPage}" ?disabled="${this.currentPage <= 1}">&lt;</button>
        <input
          .value="${this.currentPage}"
          @change="${this.handleCurrentPageChange}"
        />&nbsp;/&nbsp;<span>${this.totalPages}</span>
        <button @click="${this.handleNextPage}" ?disabled="${this.currentPage > this.totalPages}">
          &gt;
        </button>
      </div>
    `;
  }

  @property({ attribute: false })
  get pdfViewer(): PdfViewer | null {
    return this._pdfViewer;
  }

  set pdfViewer(newViewer: PdfViewer | null) {
    const oldViewer = this._pdfViewer;
    if (oldViewer) {
      oldViewer.removeEventListener("change", this.handlePdfViewerChange);
    }
    if (newViewer) {
      newViewer.addEventListener("change", this.handlePdfViewerChange);
    }
    this._pdfViewer = newViewer;
    this.requestUpdate("pdfViewer", oldViewer);
  }

  @boundMethod
  handlePdfViewerChange(): void {
    this.currentPage = this.pdfViewer?.pageNum || 0;
    this.totalPages = this.pdfViewer?.totalPages || 0;
  }

  setPage(newPage: number): void {
    if (!this.pdfViewer) {
      return;
    }
    this.pdfViewer.pageNum = newPage;
  }

  handleNextPage(): void {
    this.setPage(this.currentPage + 1);
  }

  handlePrevPage(): void {
    this.setPage(this.currentPage - 1);
  }

  handleCurrentPageChange(ev): void {
    const page = parseInt(ev.target.value);
    if (!isNaN(page)) {
      this.setPage(page);
    }
  }
}
