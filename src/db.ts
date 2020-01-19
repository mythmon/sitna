import Dexie from "dexie";

export default class SitnaDb extends Dexie {
  manuscripts: Dexie.Table<Manuscript, number>;

  constructor() {
    super("SitnaDb");

    // Initial version with just a simple list of blobs
    this.version(1).stores({
      manuscripts: "++id, blob",
    });
  }
}

export interface Manuscript {
  id?: number;
  blob: Blob;
}
