import PdfViewer from "sitna/PdfViewer";
import { makeEl } from "sitna/utils";
import BookmarkButton from "./bookmarkButton";
import ManuscriptManager from "./ManuscriptManager";
import "sitna/PdfPagination";
import StorageTracker from "./StorageTracker";

async function main(): Promise<void> {
  customElements.define("sitna-pdf-viewer", PdfViewer);
  customElements.define("sitna-bookmark-button", BookmarkButton);
  customElements.define("sitna-manuscript-manager", ManuscriptManager);

  const manager = new ManuscriptManager();

  const fileInput = makeEl("input", { accept: ".pdf", type: "file" });
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 1) {
      throw new Error("Can only open one PDF at a time");
    } else if (fileInput.files.length < 1) {
      // pdfViewer.clearFile();
    } else {
      const file = fileInput.files.item(0);
      manager.addManuscript(file);
    }
  });

  const inputDiv = makeEl("div");
  inputDiv.appendChild(fileInput);
  document.body.appendChild(inputDiv);

  const bookmarkList = makeEl("div");
  for (let i = 0; i < 10; i++) {
    const button = new BookmarkButton(manager, 1, i + 1, `button ${i + 1}`);
    bookmarkList.appendChild(button);
  }

  document.body.appendChild(bookmarkList);
  document.body.appendChild(new StorageTracker());
  document.body.appendChild(manager);
}

main();
