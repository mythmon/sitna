import PdfViewer from "sitna/PdfViewer";

interface SitnaElementTagNameMap extends HTMLElementTagNameMap {
  "sitna-pdf-viewer": PdfViewer;
}

export function makeEl<K extends keyof SitnaElementTagNameMap>(
  tagName: K,
  attributes?: { [key: string]: string },
): SitnaElementTagNameMap[K] {
  const el = document.createElement(tagName);
  for (const [key, val] of Object.entries(attributes || {})) {
    el.setAttribute(key, val);
  }
  return el as SitnaElementTagNameMap[K];
}

export function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  const reader = new FileReader();
  const p: Promise<ArrayBuffer> = new Promise((resolve, reject) => {
    reader.addEventListener("error", err => {
      reader.abort();
      reject(err);
    });
    reader.addEventListener("load", () => resolve(reader.result as ArrayBuffer));
  });
  reader.readAsArrayBuffer(blob);
  return p;
}
