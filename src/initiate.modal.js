'use strict'

import Util from "./util";
import DriveManager from "./drive-manager";
const util = new Util()
const driveManager = new DriveManager();

export default async function initiateModal() {
    
    const loadMoreButton = util.createElement("div", {
        class: "btn btn-secondary rounded-pill load-more-files",
        innerText: "Show more"
    });
    
    const footerCol = util.createElement("div", {
        class: "text-center",
        id: "load-more",
        appendChild: [loadMoreButton]
    });
    
    const footer = util.createElement("div", {
        class: "modal-footer",
        appendChild: [footerCol]
    });
    
    const body = util.createElement("div", {
        class: "modal-body",
        id: "gd-body"
    });
    
    const button = util.createElement("button", {
        class: "btn-close",
        "data-bs-dismiss": "modal",
        "aria-label": "Close"
    });
    
    const label = util.createElement("label", {
        class: "google-new-button",
        for: "google-drive-new-upload",
        innerText: "New"
    });
    
    const file = util.createElement("input", {
        type: "file",
        id: "google-drive-new-upload",
        name: "googleDriveNewUpload",
        class: "d-none"
    });
    
    const title = util.createElement("h5", {
        class: "modal-title",
        appendChild: [label, file]
    });
    
    const header = util.createElement("div", {
        class: "modal-header",
        appendChild: [title, button]
    });
    
    const content = util.createElement("div", {
        class: "modal-content",
        appendChild: [header, body, footer]
    });
    
    const dialog = util.createElement("div", {
        class: "modal-dialog modal-lg",
        appendChild: [content]
    });
    
    const modal = util.createElement("div", {
        class: "modal fade google-drive-modal",
        id: "googleDriveModal",
        "data-backdrop": "static",
        appendChild: [dialog]
    });
    
    document.body.appendChild(modal);
    
    file.addEventListener("change", driveManager.uploadFile);
    loadMoreButton.addEventListener("click", driveManager.loadMore);
}
