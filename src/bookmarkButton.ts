import { makeEl } from "./utils";
import { boundMethod } from "autobind-decorator";
import ManuscriptManager from "./ManuscriptManager";


export default class BookmarkButton extends HTMLElement {
  manager?: ManuscriptManager;
  
  constructor(manager = null, manuscriptId = null, manuscriptPage = 1, name = "Missing Num") {
    super();
    this.attachShadow({ mode: "open" });
    this.manager = manager
    this.manuscriptId = manuscriptId
    this.manuscriptPage = manuscriptPage
    this.name = name
  }

  connectedCallback(): void {
    const button = makeEl("button", {}, this.name);
    button.addEventListener("click", this.handleButtonClick);
    this.shadowRoot.appendChild(button);
  } 

  @boundMethod
  handleButtonClick(): void{
    this.manager.showManuscriptPage(this.manuscriptId, this.manuscriptPage)
  }

  get manuscriptId(): number {
    return parseInt(this.getAttribute("manuscriptId"))
  }

  set manuscriptId(manuscriptId) {
    this.setAttribute("manuscriptId", manuscriptId.toString())
  }

  get manuscriptPage(): number {
    return parseInt(this.getAttribute("manuscriptPage"))
  }

  set manuscriptPage(manuscriptPage) {
    this.setAttribute("manuscriptPage", manuscriptPage.toString())
  }

  get name(): string {
    return this.getAttribute("name")
  }
  
  set name(name) {
    this.setAttribute("name", name)
  }
}