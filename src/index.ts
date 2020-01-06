import { boundMethod } from 'autobind-decorator';

import PdfViewer from 'sitna/PdfViewer';
import { makeEl } from 'sitna/utils';

async function main() {
  customElements.define('sitna-pdf-viewer', PdfViewer);

  const pdfViewer = makeEl('sitna-pdf-viewer');

  const fileInput = makeEl('input', { accept: 'pdf', type: 'file' });
  fileInput.addEventListener('change', ev => {
    if (fileInput.files.length > 1) {
      throw new Error("Can only open one PDF at a time");
    } else if (fileInput.files.length < 1) {
      // pdfViewer.clearFile();
    } else {
      pdfViewer.setFile(fileInput.files.item(0));
    }
  });

  const inputDiv = makeEl('div');
  inputDiv.appendChild(fileInput);
  document.body.appendChild(inputDiv);
  document.body.appendChild(pdfViewer);
}

main();
