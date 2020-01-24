import Dexie from "dexie";

export default class SitnaDb extends Dexie {
  manuscripts: Dexie.Table<Manuscript, number>;
  bookmarks:  Dexie.Table<Bookmarks, number>

  constructor() {
    super("SitnaDb");

    // Initial version with just a simple list of blobs
    this.version(1).stores({
      manuscripts: "++id, blob",
    });
    this.version(2).stores({
      bookmarks:"++id, name, page, manId",
    });
  }
}

export interface Manuscript {
  id?: number;
  blob: Blob;
}

interface Bookmarks {
  id?: number;
  name: string;
  page: number;
  manId: number;
}
