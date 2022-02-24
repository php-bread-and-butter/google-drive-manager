"use strict";
import IconFile from 'Assets/icon/file.png';
import NoItems from 'Assets/icon/no-items.png';

export default class Util {
    
    constructor() {
        this.container;
    }
    
    createElement(tag, attributes)
    {
        let element = document.createElement(tag);
        for (const key in attributes) {
            switch (key) {
                case 'innerText':
                element.innerText = attributes[key]
                break;
                
                case 'innerHTML':
                element.innerHTML = attributes[key]
                break;
                
                case 'appendChild':
                if (Array.isArray(attributes[key])) {
                    element.append(...attributes[key])
                } else {
                    element.appendChild(attributes[key])
                }
                break;
                
                case 'addEventListener':
                
                if (Array.isArray(attributes[key])) 
                {
                    for (const event of attributes[key]) {
                        let useCapture = event.useCapture || false
                        element.addEventListener(event.action, event.method, useCapture)
                    }
                }
                else
                {
                    let useCapture = attributes[key].useCapture || false
                    element.addEventListener(attributes[key].action, attributes[key].method, useCapture)
                }
                break;
                
                default:
                element.setAttribute(key, attributes[key]);
                break;
            }
        }
        
        return element;
    }
    
    loadScript (src, callback)
    {
        var s,
        r,
        t;
        r = false;
        s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = src;
        s.onload = s.onreadystatechange = () => {
            if ( !r && (!this.readyState || this.readyState == 'complete') )
            {
                r = true;
                return callback.call(this);
            }
        };
        t = document.getElementsByTagName('script')[0];
        t.parentNode.insertBefore(s, t);
    }
    
    appendPre(selector, message) {
        var pre = document.querySelector(selector);
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
    }

    showListFile(selector, files) {
        let cells = [];
        if (files && files.length > 0) {
            for (const file of files) {
                let col = this.getThumbnail(file);
                cells.push(col);
            }
            
        } else {
            const img = this.createElement("img", {
                class: "no-item-img",
                src: NoItems
            });
            const col = this.createElement("div", {
                class: "text-center",
                id: "no-items",
                appendChild: [img]
            });

            cells.push(col);
        }

        this.container = this.createElement("div", {
            class: "row-cards",
            appendChild: cells
        });

        return this.container;
    }

    getSpinner(size) {
        const spinner = this.createElement("div", {
            class: "spinner-border",
            style: size != "small" ? "width: 3rem; height: 3rem;" : ""
        });
        
        const spinnerWrap = this.createElement("div", {
            class: "text-center spinner--wrapper",
            appendChild: [spinner]
        });

        return spinnerWrap;
    }

    loadSpinner(selector) {
        const spinner = this.getSpinner();
        const pre = document.querySelector(selector);
            pre.innerHTML = "";
            pre.appendChild(spinner);
    }

    getThumbnail(file) {
        const icon = this.createElement("img", {
            class: "card-icon gdcard-icon",
            src: file.iconLink
        });
        const name = this.createElement("a", {
            class: "card-name gdcard-name",
            href: file.webContentLink,
            target: "_blank",
            innerHTML: file.name
        });
        const title = this.createElement("h5", {
            class: "card-title gdcard-title",
            appendChild: [icon, name]
        });
        const text = this.createElement("p", {
            class: "card-text gdcard-text",
            // innerHTML: file.webContentLink
        });
        const body = this.createElement("div", {
            class: "card-body gdcard-body",
            appendChild: [title, text]
        });
        const img = this.createElement("img", {
            class: "card-img-top gdcard-img-top",
            src: file.thumbnailLink || IconFile
        });
        const card = this.createElement("div", {
            class: "card gdcard",
            appendChild: [img, body]
        });
        const content = this.createElement("div", {
            class: "col-card__content",
            appendChild: [card]
        });
        const col = this.createElement("div", {
            class: "col-card",
            appendChild: [content]
        });

        return col;
    }

    showPlaceHolder(selector, file) {
        let fileData = {
            "iconLink" : "",
            "webContentLink" : "",
            "name" : file.name,
            "thumbnailLink" : ""
        }
        const images = [];
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                if(this.isFileImage(file)) {
                    fileData.thumbnailLink = reader.result;
                } else {
                    fileData.thumbnailLink = IconFile;
                }

                const spinner = this.getSpinner("small");
                const filePreview = this.getThumbnail(fileData);
                filePreview.classList.add("placeholder");
                filePreview.prepend(spinner);
                
                const pre = document.querySelector(selector);
                pre.childNodes[0].prepend(filePreview);
                
                resolve(filePreview);
            }, false);

            if (file) {
                reader.readAsDataURL(file);
            }
        });
    }

    appendFile(placeholder, fileData) {
        
        const filePreview = this.getThumbnail(fileData);
        const parentNode = placeholder.parentNode;

        placeholder.remove();
        parentNode.prepend(filePreview);
    }

    isFileImage(file) {
        return file && file['type'].split('/')[0] === 'image';
    }
}