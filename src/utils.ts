import PdfViewer from "sitna/PdfViewer";

interface SitnaElementTagNameMap extends HTMLElementTagNameMap {
  "sitna-pdf-viewer": PdfViewer;
}

export function makeEl<K extends keyof SitnaElementTagNameMap>(
  tagName: K,
  attributes?: { [key: string]: string },
  text?: string,
): SitnaElementTagNameMap[K] {
  const el = document.createElement(tagName);
  for (const [key, val] of Object.entries(attributes || {})) {
    el.setAttribute(key, val);
  }
  el.textContent = text;
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

export enum StorageState {
  /** Persistence is never possible. */
  Unsupported = "unsupported",

  /** Data is already persisted. */
  Persisted = "persisted",

  /** The persistence state is not yet known. */
  Unknown = "unknown",

  /** Persistence may be possible with a user prompt. */
  Prompt = "prompt",

  /** The user or browser has (probably) denied persistence. */
  Denied = "denied",

  /** Even though the feature is supported, we can't persist data. */
  Never = "never",
}

/**
 * Proxy that provides access to `navigator.storage`, safely falling back if the
 * API is not available
 */
class StorageProxy {
  private hasApi(name): boolean {
    return navigator.storage && navigator.storage[name];
  }

  /**
   * Check if storage is persisted already.
   *
   * Returns true if current origin is using persistent storage, and false if not.
   */
  async persisted(): Promise<boolean | null> {
    if (!this.hasApi("persisted")) {
      return false;
    }
    return (await navigator.storage.persisted()) || false;
  }

  /**
   * Tries to convert to persisted storage.
   * Returns true if successfully persisted the storage, and false if not.
   */
  async persist(): Promise<boolean> {
    if (!this.hasApi("persist")) {
      return false;
    }
    return navigator.storage.persist() || false;
  }

  /**
   * Queries available disk quota.
   *
   * Returns null if the API is not supported.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/StorageEstimate
   */
  async estimate(): Promise<StorageEstimate | null> {
    if (!this.hasApi("estimate")) {
      return null;
    }
    return await navigator.storage.estimate();
  }

  /**
   * Tries to persist data for this origin without prompting the user.
   */
  async state(): Promise<StorageState> {
    if (!this.hasApi("persisted")) {
      return StorageState.Unsupported;
    }

    if (await this.persisted()) {
      return StorageState.Persisted;
    }

    if (!navigator.permissions || !navigator.permissions.query) {
      return StorageState.Prompt; // It MAY be successful to prompt. Don't know.
    }

    const permission = await navigator.permissions.query({ name: "persistent-storage" });
    if (permission.state === "granted") {
      if (this.persist()) {
        return StorageState.Persisted;
      } else {
        return StorageState.Denied;
      }
    }
    if (permission.state === "prompt") {
      return StorageState.Prompt;
    }

    /** We have no way of telling, so it might as well be impossible. */
    return StorageState.Never;
  }
}

export const storage = new StorageProxy();
