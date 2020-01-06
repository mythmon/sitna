import * as pdfjs from "pdfjs-dist/webpack";

import { makeEl, readBlobAsArrayBuffer } from "sitna/utils";

export default class PdfViewer extends HTMLElement {
  file: File;
  canvas: HTMLCanvasElement;

  constructor() {
    super();
    this.file = null;
    this.attachShadow({ mode: "open" });
    this.canvas = makeEl("canvas");
    this.shadowRoot.appendChild(this.canvas);
  }

  async setFile(file: File): Promise<void> {
    this.file = file;

    const fileContents = await readBlobAsArrayBuffer(this.file);
    const pdf = await pdfjs.getDocument(fileContents).promise;
    const page = await pdf.getPage(1);

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
