import SitnaDb from "./db";

export default class BookmarkManager {
  _db: SitnaDb;
  
  get db(): SitnaDb {
    if (!this._db) {
      this._db = new SitnaDb();
    }
    return this._db;
  }

  async addBookMark(page: number, name: string, manId: number): Promise<void> {
    await this.db.bookmarks.add({ name, page, manId});
  }

  async deleteBookmark(id: number): Promise<void>{
    await this.db.bookmarks.delete(id);
  }

  async getAllBookmarks(): Promise<void> {
    await this.db.bookmarks.toArray();
  }

  async updateBookmark(id: number, page: number, name: string): Promise<void> {
    await this.db.bookmarks.update(id, {name, page});
  }

}