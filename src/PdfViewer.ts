import * as pdfjs from "pdfjs-dist/webpack";

import { readBlobAsArrayBuffer } from "sitna/utils";
import { LitElement, customElement, TemplateResult, html, property } from "lit-element";
import { PDFDocumentProxy } from "pdfjs-dist/webpack";
import SitnaDb from "./db";

@customElement("sitna-pdf-viewer")
export default class PdfViewer extends LitElement {
  _db: SitnaDb;
  _manuscriptId: number;
  _pdf: pdfjs.PDFDocumentProxy | null;
  _pageNum: number;

  constructor() {
    super();
    this._db = null;
    this._manuscriptId = null;
    this._pageNum = 0;
  }

  get db(): SitnaDb {
    if (!this._db) {
      this._db = new SitnaDb();
    }
    return this._db;
  }

  @property({ type: Number })
  get pageNum(): number {
    return this._pageNum;
  }

  set pageNum(newPage: number) {
    const oldValue = this._pageNum;
    this._pageNum = newPage;
    this.requestUpdate("pageNum", oldValue);
    this.redraw();
  }

  @property({ type: Number })
  get manuscriptId(): number {
    return this._manuscriptId;
  }

  set manuscriptId(newId: number) {
    const oldValue = this._manuscriptId;
    this._manuscriptId = newId;
    this.requestUpdate("manuscriptId", oldValue);
    (async (): Promise<void> => {
      const manuscript = await this.db.manuscripts.get(this.manuscriptId);
      const blobContents = await readBlobAsArrayBuffer(manuscript.blob);
      this._pdf = await pdfjs.getDocument(blobContents).promise;
      this.redraw();
    })();
  }

  render(): TemplateResult {
    return html`
      <canvas></canvas>
    `;
  }

  get totalPages(): number {
    if (!this._pdf) {
      return 0;
    }
    return this._pdf.numPages;
  }

  get canvas(): HTMLCanvasElement | null {
    return this.shadowRoot.querySelector("canvas");
  }

  async redraw(): Promise<void> {
    if (!this._pdf) {
      return;
    }

    const pageNum = Math.min(this.pageNum, this.totalPages);
    if (isNaN(pageNum)) {
      return;
    }
    const page = await this._pdf.getPage(pageNum);
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
