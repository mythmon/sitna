import SitnaDb from "./db";
import { makeEl } from "./utils";

export default class BookmarkManager extends HTMLElement {
  _db: SitnaDb;
  
  get db(): SitnaDb {
    if (!this._db) {
      this._db = new SitnaDb();
    }
    return this._db;
  }

  connectedCallback(): void {
    const button = makeEl("button", {"title": "Add a bookmark"}, "+");
  }
  
  async addBookMark(page: number, name: string, manId: number): Promise<void> {
    await this.db.bookmarks.add({ name: name, page: page, manId: manId });
  }

  async deleteBookmark(id: number): Promise<void>{
    await this.db.bookmarks.delete(id);
  }

  async getAllBookmarks(): Promise<void> {
    await this.db.bookmarks.toArray();
  }

  async updateBookmark(id: number, page: number, name: string): Promise<void> {
    await this.db.bookmarks.update(id, {name: name, page: page});
  }
}