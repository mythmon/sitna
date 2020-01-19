import SitnaDb, { Manuscript } from "./db";
import "./PdfViewer";
import "./PdfPagination";
import { boundMethod } from "autobind-decorator";
import {
  LitElement,
  customElement,
  CSSResult,
  css,
  html,
  property,
  TemplateResult,
} from "lit-element";
import { repeat } from "lit-html/directives/repeat";
import { readBlobAsArrayBuffer } from "./utils";
import * as pdfjs from "pdfjs-dist/webpack";

enum ViewMode {
  Single = "single",
  TwoSpread = "two-spread",
}

@customElement("sitna-manuscript-manager")
export default class ManuscriptManager extends LitElement {
  _db: SitnaDb;

  constructor() {
    super();
    this._db = null;
    this.views = [];
  }

  @property({ attribute: false })
  manuscripts: Array<Manuscript> = [];

  @property({ type: String })
  viewMode = ViewMode.Single;

  @property({ attribute: false })
  views: Array<{ manuscriptId: number; pageNum: number; numPages: number }> = [];

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
      }
    `;
  }

  render(): TemplateResult {
    return html`
      <div class="library">
        ${repeat(
          this.manuscripts,
          m => m.id,
          manuscript => html`
            <button @click="${this.handleLibraryButtonClick}" data-manuscript-id="${manuscript.id}">
              Manuscript #${manuscript.id}
            </button>
          `,
        )}
      </div>

      <div @change="${this.handleViewModeChange}">
        View mode:
        <input
          type="radio"
          name="view-mode"
          id="viewmode-single"
          value="${ViewMode.Single}"
          ?checked="${this.viewMode == ViewMode.Single}"
        />
        <label for="viewmode-single">Single</label>
        <input
          type="radio"
          name="view-mode"
          id="viewmode-two-spread"
          value="${ViewMode.TwoSpread}"
          ?checked="${this.viewMode == ViewMode.TwoSpread}"
        />
        <label for="viewmode-two-spread">Two Spread</label>
      </div>

      ${this.renderViewArea()}
    `;
  }

  renderViewArea(): TemplateResult {
    if (!this.views.length) {
      return null;
    }

    switch (this.viewMode) {
      case ViewMode.Single: {
        const { manuscriptId, pageNum, numPages } = this.views[0];
        return html`
          <sitna-pdf-pagination
            currentPage="${pageNum}"
            totalPages="${numPages}"
            .toChangePage="${this.setPageNumber}"
          ></sitna-pdf-pagination>
          <sitna-pdf-viewer manuscriptId="${manuscriptId}" pageNum="${pageNum}"></sitna-pdf-viewer>
        `;
      }

      case ViewMode.TwoSpread: {
        const { manuscriptId, numPages } = this.views[0];
        let { pageNum } = this.views[0];

        // Assume all spreads start with the left page as an odd number. If
        // pageNum is an even number, then we are showing the wrong half of a
        // page. Make it so that page is shown as the right-side page.
        if (pageNum % 2 == 0) {
          pageNum -= 1;
        }

        return html`
          <sitna-pdf-pagination
            currentPage="${pageNum}"
            totalPages="${numPages}"
            .toChangePage="${this.setPageNumber}"
            step="2"
          ></sitna-pdf-pagination>
          <sitna-pdf-viewer manuscriptId="${manuscriptId}" pageNum="${pageNum}"></sitna-pdf-viewer>
          <sitna-pdf-viewer
            manuscriptId="${manuscriptId}"
            pageNum="${pageNum + 1}"
          ></sitna-pdf-viewer>
        `;
      }

      default: {
        return html`
          <span class="error">Error: unknown view mode ${this.viewMode}</span>
        `;
      }
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.updateLibrary();
  }

  disconnectedCallback(): void {
    if (this._db) {
      this._db.close();
      this._db = null;
    }
  }

  get db(): SitnaDb {
    if (!this._db) {
      this._db = new SitnaDb();
    }
    return this._db;
  }

  async addManuscript(blob: Blob): Promise<void> {
    await this.db.manuscripts.add({ blob });
    this.updateLibrary();
    document.dispatchEvent(new CustomEvent("sitna-storage-change"));
  }

  async updateLibrary(): Promise<void> {
    this.manuscripts = await this.db.manuscripts.toArray();
  }

  @boundMethod
  async handleLibraryButtonClick(ev: InputEvent): Promise<void> {
    const manuscriptId = parseInt((ev.target as HTMLElement).dataset.manuscriptId);
    await this.showManuscriptPage(manuscriptId);
  }

  async showManuscriptPage(manuscriptId, pageNum = 1): Promise<void> {
    const manuscript = this.manuscripts.find(m => m.id == manuscriptId);
    if (!manuscript) {
      throw new Error(`Manuscript with id ${manuscriptId} not found`);
    }

    const blobContents = await readBlobAsArrayBuffer(manuscript.blob);
    const pdf = await pdfjs.getDocument(blobContents).promise;

    this.views = [{ manuscriptId, pageNum, numPages: pdf.numPages }];
    this.requestUpdate();
  }

  @boundMethod
  handleViewModeChange(ev: InputEvent): void {
    this.viewMode = (ev.target as HTMLInputElement).getAttribute("value") as ViewMode;
  }

  @boundMethod
  setPageNumber(pageNum: number): void {
    if (this.viewMode == ViewMode.Single || this.viewMode == ViewMode.TwoSpread) {
      for (let i = 0; i < this.views.length; i++) {
        this.views[i].pageNum = pageNum + i;
      }
    } else {
      throw new Error(`Unkown view mode ${this.viewMode}`);
    }
    this.requestUpdate("views");
  }
}
