import PdfViewer from "sitna/PdfViewer";
import { makeEl } from "sitna/utils";
import PdfPagination from "./PdfPagination";

async function main(): Promise<void> {
  customElements.define("sitna-pdf-viewer", PdfViewer);
  customElements.define("sitna-pdf-pagination", PdfPagination);

  let pdfViewer;
  let pagination;

  const fileInput = makeEl("input", { accept: ".pdf", type: "file" });
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 1) {
      throw new Error("Can only open one PDF at a time");
    } else if (fileInput.files.length < 1) {
      // pdfViewer.clearFile();
    } else {
      pdfViewer = new PdfViewer();
      pdfViewer.setFile(fileInput.files.item(0));

      pagination = new PdfPagination(pdfViewer);

      document.body.appendChild(pagination);
      document.body.appendChild(pdfViewer);
    }
  });

  const inputDiv = makeEl("div");
  inputDiv.appendChild(fileInput);
  document.body.appendChild(inputDiv);
}

main();
