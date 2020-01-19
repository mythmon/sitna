import { LitElement, html } from "lit-element";


export default class BookmarkToolBar extends LitElement {

    render(){
        return html`
        <div class="bookmark-toolbar">
            <button class="add-bookmark">add</button>
            <button class="edit-bookmark">edit</button>
        </div>

        `
    }
}