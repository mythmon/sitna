import SitnaDb, {Manuscript} from "./db";
import { makeEl } from "./utils";
import PdfViewer from "./PdfViewer";
import PdfPagination from "./PdfPagination";
import { boundMethod } from "autobind-decorator";
import { LitElement, customElement, CSSResult, css, html, property } from "lit-element";
import { repeat } from "lit-html/directives/repeat";

@customElement('sitna-manuscript-manager')
export default class ManuscriptManager extends LitElement {
  _db: SitnaDb;
  viewers: Array<{
    manuscriptId: number;
    page: number;
    viewer: PdfViewer;
    pagination: PdfPagination;
  }>;

  constructor() {
    super();
    this._db = null;
    this.viewers = [];
  }

  @property({ attribute: false })
  manuscripts = []

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
      }
    `;
  }

  render() {
    const viewer = new PdfViewer();
    return html`
      <div class="library">
        ${repeat(this.manuscripts, m => m.id, manuscript => html`
          <button
            @click="${this.handleLibraryButtonClick}"
            data-manuscript-id="${manuscript.id}"
          >
            Manuscript #${manuscript.id}
          </button>
        `)}
      </div>
      <sitna-pdf-pagination .pdfViewer="${viewer}"></sitna-pdf-pagination>
      ${viewer}
    `;
  }

  get pdfViewer(): PdfViewer {
    return this.shadowRoot.querySelector('stina-pdf-viewer');
  }

  get paginator(): PdfPagination {
    return this.shadowRoot.querySelector('sitna-pdf-pagination');
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
  async handleLibraryButtonClick(ev): Promise<void> {
    const manuscriptId = parseInt(ev.target.dataset.manuscriptId);
    this.showManuscriptPage(manuscriptId);
  }

  async showManuscriptPage(manuscriptId, pageNum = 1): Promise<void> {
    const manuscript = await this.db.manuscripts.get(manuscriptId);
    const viewer = this.shadowRoot.querySelector("sitna-pdf-viewer") as PdfViewer;
    await viewer.setBlob(manuscript.blob, pageNum);
  }
}
