import SitnaDb from "./db";
import { makeEl } from "./utils";
import PdfViewer from "./PdfViewer";
import PdfPagination from "./PdfPagination";
import { boundMethod } from "autobind-decorator";

const template: HTMLTemplateElement = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
  </style>
  <div class="library"></div>
  <sitna-pdf-pagination></sitna-pdf-pagination>
  <sitna-pdf-viewer></sitna-pdf-viewer>
`;

export default class ManuscriptManager extends HTMLElement {
  _db: SitnaDb;
  viewers: Array<{
    manuscriptId: number;
    page: number;
    viewer: PdfViewer;
    pagination: PdfPagination;
  }>;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this._db = null;
    this.viewers = [];
  }

  connectedCallback(): void {
    this.shadowRoot.appendChild(template.content.cloneNode(/* deep */ true));
    const pdfViewer = this.shadowRoot.querySelector("sitna-pdf-viewer") as PdfViewer;
    const paginator = this.shadowRoot.querySelector("sitna-pdf-pagination") as PdfPagination;
    paginator.pdfViewer = pdfViewer;
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
    document.dispatchEvent(new CustomEvent("sitna-storage-change"));
    this.updateLibrary();
  }

  async updateLibrary(): Promise<void> {
    const newLibraryEl = makeEl("div", { class: "library" });
    await this.db.manuscripts.each(manuscript => {
      const manuscriptButton = makeEl("button");
      manuscriptButton.textContent = `Manuscript #${manuscript.id}`;
      manuscriptButton.dataset.manuscriptId = manuscript.id.toString();
      manuscriptButton.addEventListener("click", this.handleLibraryButtonClick);
      newLibraryEl.appendChild(manuscriptButton);
    });
    const oldLibraryEl = this.shadowRoot.querySelector(".library");
    // this.shadowRoot.prepend(newLibraryEl);
    // this.shadowRoot.removeChild(oldLibraryEl);
    this.shadowRoot.replaceChild(newLibraryEl, oldLibraryEl);
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
