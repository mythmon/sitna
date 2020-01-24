import { LitElement, html, customElement } from "lit-element";
import { boundMethod } from "autobind-decorator";

@customElement('sitna-bookmark-tool-bar')
export default class BookmarkToolBar extends LitElement {

  @boundMethod
  async addNewBookmark(): Promise<void>{
    console.log("click")
  }


  render(){
    return html`
    <div class="bookmark-toolbar">
      <button class="add-bookmark"
        @click="${this.addNewBookmark}"
      >
        add
      </button>
      <button class="edit-bookmark">edit</button>
    </div>

    `
  }
}
