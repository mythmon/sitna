import Dexie from "dexie";

export default class SitnaDb extends Dexie {
  manuscripts: Dexie.Table<Manuscript, number>;

  constructor() {
    super("SitnaDb");
    this.version(1).stores({
      manuscripts: "++id, blob",
    });
  }
}

interface Manuscript {
  id?: number;
  blob: Blob;
}
