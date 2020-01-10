import PdfViewer from "sitna/PdfViewer";
import { makeEl } from "sitna/utils";
import PdfPagination from "./PdfPagination";
import SitnaDb from "./db";
import BookmarkButton from "./bookmarkButton";

async function main(): Promise<void> {
  customElements.define("sitna-pdf-viewer", PdfViewer);
  customElements.define("sitna-pdf-pagination", PdfPagination);
  customElements.define("sitna-bookmark-button", BookmarkButton);


  let pdfViewer;
  let pagination;

  const db = new SitnaDb();
  const manuscripts = await db.manuscripts.toArray();

  const fileInput = makeEl("input", { accept: ".pdf", type: "file" });
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 1) {
      throw new Error("Can only open one PDF at a time");
    } else if (fileInput.files.length < 1) {
      // pdfViewer.clearFile();
    } else {
      const file = fileInput.files.item(0);
      db.manuscripts.add({ blob: file });

      pdfViewer = new PdfViewer();
      pdfViewer.setFile(file);

      pagination = new PdfPagination(pdfViewer);

      document.body.appendChild(pagination);
      document.body.appendChild(pdfViewer);
    }
  });

  const inputDiv = makeEl("div");
  inputDiv.appendChild(fileInput);
  document.body.appendChild(inputDiv);

  async function manuscriptButtonHandler(ev): Promise<void> {
    const manuscript = await db.manuscripts.get(parseInt(ev.target.dataset.manuscriptId));
    pdfViewer = new PdfViewer();
    pdfViewer.setFile(manuscript.blob);
    pagination = new PdfPagination(pdfViewer);
    document.body.appendChild(pagination);
    document.body.appendChild(pdfViewer);
  }

  const libraryDiv = makeEl("div");
  for (const manuscript of manuscripts) {
    const manuscriptButton = makeEl("button");
    manuscriptButton.textContent = `Manuscript #${manuscript.id}`;
    manuscriptButton.dataset.manuscriptId = manuscript.id.toString();
    manuscriptButton.addEventListener("click", manuscriptButtonHandler);
    libraryDiv.appendChild(manuscriptButton);
  }
  document.body.appendChild(libraryDiv);

  const bookmarkList = makeEl("div");
  const button = new BookmarkButton();
  bookmarkList.appendChild(button);
  document.body.appendChild(bookmarkList);
}

main();
