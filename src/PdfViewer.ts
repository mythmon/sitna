import * as pdfjs from "pdfjs-dist/webpack";

import { makeEl, readBlobAsArrayBuffer } from "sitna/utils";

export default class PdfViewer extends HTMLElement {
  canvas: HTMLCanvasElement;
  pdf?: pdfjs.PDFDocumentProxy;

  static get observedAttributes(): Array<string> {
    return ["pageNum"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.canvas = null;
    this.pdf = null;
  }

  connectedCallback(): void {
    if (!this.hasAttribute("pageNum")) {
      this.setAttribute("pageNum", "1");
    }

    this._upgradeProperty("pageNum");

    this.canvas = makeEl("canvas");
    this.shadowRoot.appendChild(this.canvas);
  }

  /**
   * Get any value of prop that may have been set on this element before the
   * custom element definition loaded.
   */
  _upgradeProperty(prop): void {
    if (this.hasOwnProperty(prop)) {
      const temp = this[prop];
      delete this[prop];
      this[prop] = temp;
    }
  }

  async setBlob(blob: Blob, pageNum?: number): Promise<void> {
    const blobContents = await readBlobAsArrayBuffer(blob);
    this.pdf = await pdfjs.getDocument(blobContents).promise;
    if (pageNum) {
      this.changePage(pageNum, false);
    }
    this.redraw();
    this.dispatchEvent(new CustomEvent("pdf-change"));
    this.dispatchEvent(new CustomEvent("change"));
  }

  async changePage(pageNum: number, redraw = true): Promise<void> {
    this.setAttribute("pageNum", pageNum.toString());
    this.dispatchEvent(new CustomEvent("page-change"));
    this.dispatchEvent(new CustomEvent("change"));
    if (redraw) {
      await this.redraw();
    }
  }

  set pageNum(value: number) {
    this.changePage(value);
  }

  get pageNum(): number {
    return parseInt(this.getAttribute("pageNum"));
  }

  get totalPages(): number {
    if (!this.pdf) {
      return 1;
    }
    return this.pdf.numPages;
  }

  async redraw(): Promise<void> {
    const pageNum = Math.min(this.pageNum, this.totalPages);
    if (isNaN(pageNum)) {
      return;
    }
    const page = await this.pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });

    const context = this.canvas.getContext("2d");
    this.canvas.height = viewport.height;
    this.canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
  }
}
