import * as pdfjs from "pdfjs-dist/webpack";

import { makeEl, readBlobAsArrayBuffer } from "sitna/utils";
import { LitElement, customElement, TemplateResult, html, property } from "lit-element";
import { PDFDocumentProxy } from "pdfjs-dist/webpack";

@customElement('sitna-pdf-viewer')
export default class PdfViewer extends LitElement {
  _pdf: pdfjs.PDFDocumentProxy | null;
  _pageNum: number;

  constructor() {
    super();
    this._pageNum = 0;
    this._pdf = null;
  }

  @property({ type: Number })
  get pageNum() {
    return this._pageNum;
  }

  set pageNum(value: number) {
    let oldValue = this._pageNum;
    this._pageNum = value;
    this.dispatchEvent(new CustomEvent("page-change"));
    this.dispatchEvent(new CustomEvent("change"));
    this.redraw();
    this.requestUpdate("pageNum", oldValue);
  }

  @property({ attribute: false })
  pdf = null;

  render(): TemplateResult {
    return html`<canvas></canvas>`;
  }

  async setBlob(blob: Blob, pageNum?: number): Promise<void> {
    const blobContents = await readBlobAsArrayBuffer(blob);
    this.pdf = await pdfjs.getDocument(blobContents).promise;
    if (pageNum) {
      this.pageNum = pageNum;
    } else {
      this.redraw();
      // the pageNum setter also emits a change event. Don't double it.
      this.dispatchEvent(new CustomEvent("change"));
    }
    this.dispatchEvent(new CustomEvent("pdf-change"));
  }

  get totalPages(): number {
    if (!this.pdf) {
      return 1;
    }
    return this.pdf.numPages;
  }

  get canvas(): HTMLCanvasElement | null {
    return this.shadowRoot.querySelector('canvas');
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
