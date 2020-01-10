import { makeEl } from "./utils";
import { boundMethod } from "autobind-decorator";

export default class BookmarkButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    const button = makeEl("button", {}, "Hello");
    button.addEventListener("click", this.handleButtonClick);
    this.shadowRoot.appendChild(button);
  } 

  @boundMethod
  handleButtonClick(): void{
    console.log("Clicked")
  }

}