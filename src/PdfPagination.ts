import { boundMethod } from "autobind-decorator";

import PdfViewer from "sitna/PdfViewer";

const template: HTMLTemplateElement = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }

    #current-page {
      width: 20px;
    }
  </style>
  <div>
    <button id="previous-page">&lt;</button>
    <input id="current-page" />&nbsp;/&nbsp;<span id="total-pages">1</span>
    <button id="next-page">&gt;</button>
  </div>
`;

export default class PdfPagination extends HTMLElement {
  _pdfViewer?: PdfViewer;
  prevPageEl: HTMLButtonElement;
  nextPageEl: HTMLButtonElement;
  currentPageEl: HTMLInputElement;
  totalPagesEl: HTMLSpanElement;

  constructor(pdfViewer = null) {
    super();
    this.attachShadow({ mode: "open" });
    this.pdfViewer = pdfViewer;
  }

  connectedCallback(): void {
    this.shadowRoot.appendChild(template.content.cloneNode(/* deep */ true));
    this.prevPageEl = this.shadowRoot.querySelector("#previous-page");
    this.nextPageEl = this.shadowRoot.querySelector("#next-page");
    this.currentPageEl = this.shadowRoot.querySelector("#current-page");
    this.totalPagesEl = this.shadowRoot.querySelector("#total-pages");

    this.nextPageEl.addEventListener("click", this.handleNextPage);
    this.prevPageEl.addEventListener("click", this.handlePrevPage);
    this.currentPageEl.addEventListener("change", this.handleCurrentPageChange);

    this.update();
  }

  get pdfViewer(): PdfViewer | null {
    return this._pdfViewer;
  }

  set pdfViewer(value) {
    if (this._pdfViewer) {
      this._pdfViewer.removeEventListener("change", this.handlePdfViewerChange);
    }
    if (value) {
      value.addEventListener("change", this.handlePdfViewerChange);
    }
    this._pdfViewer = value;
    this.update();
  }

  get currentPage(): number {
    if (!this.pdfViewer) {
      return 1;
    }
    return this.pdfViewer.pageNum;
  }

  get totalPages(): number {
    if (!this.pdfViewer) {
      return 1;
    }
    return this.pdfViewer.totalPages;
  }

  update(): void {
    if (!this.isConnected) {
      return;
    }
    if (isNaN(this.currentPage)) {
      this.currentPageEl.value = "";
    } else {
      this.currentPageEl.value = this.currentPage.toString();
    }

    this.totalPagesEl.textContent = this.totalPages.toString();

    this.prevPageEl.disabled = this.currentPage <= 1;
    this.nextPageEl.disabled = this.currentPage >= this.totalPages;
  }

  @boundMethod
  handlePdfViewerChange(): void {
    console.log("paginator observed a pdf change event");
    this.update();
  }

  setPage(newPage: number): void {
    if (!this.pdfViewer) {
      return;
    }
    this.pdfViewer.pageNum = newPage;
  }

  @boundMethod
  handleNextPage(): void {
    this.setPage(this.currentPage + 1);
  }

  @boundMethod
  handlePrevPage(): void {
    this.setPage(this.currentPage - 1);
  }

  @boundMethod
  handleCurrentPageChange(ev): void {
    const page = parseInt(ev.target.value);
    if (!isNaN(page)) {
      this.setPage(page);
    }
  }
}
