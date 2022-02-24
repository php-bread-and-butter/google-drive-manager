import Util from "./util";

export default class Modal extends Util {
    
    constructor(element){
        super();
        this.backdrop;
        this._isShown = false;
        this._element = document.querySelector(element);
        this._selectorDataDismiss = document.querySelector('[data-bs-dismiss="modal"]');

        this._selectorDataDismiss.addEventListener("click", () => {
            this.hide();
        });
    }

    show() {
        document.body.classList.add("modal-open");
        document.body.setAttribute("style", "overflow: hidden; padding-right: 0px;");

        this._element.classList.add("show");
        this._element.classList.add("in");
        this._element.style.display = "block";
        this._element.setAttribute("aria-modal", true);
        this._element.setAttribute("role", "dialog");
        
        this._showBackdrop();

        this._isShown = true;
    }

    _showBackdrop() {
        this.backdrop = this.createElement("div", {
            class: "modal-backdrop fade show"
        });

        document.body.appendChild(this.backdrop);
    }

    _removeBackdrop() {
        this.backdrop.remove();
    }

    hide() {
        document.body.classList.remove("modal-open");
        document.body.removeAttribute("style");
        
        this._element.classList.remove("show");
        this._element.classList.remove("in");
        this._element.style.display = "none";
        this._element.removeAttribute("aria-modal");
        this._element.removeAttribute("role");
        this._element.setAttribute("aria-hidden", true);

        this._removeBackdrop();
    }
}