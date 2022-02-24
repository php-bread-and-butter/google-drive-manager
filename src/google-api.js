"use strict";

import Util from "./util";
import Config from './config.json';
import Modal from "./gd-modal";

export default class GoogleApi extends Util {
    constructor()
    {
        super();
        this.button;
        this.modal = '#googleDriveModal';
        this.selector = '#gd-body';
    }
    
    init(config)
    {
        this.setConfig(config);
        this.renderDriveButton(config);
        this.loadGoogleApi();
    }
    
    setConfig(config) {
        Config.CLIENT_ID      = config.clientId || Config.CLIENT_ID;
        Config.CLIENT_SECRET  = config.clientSecret || Config.CLIENT_SECRET;
        Config.API_URL        = config.apiUrl || Config.API_URL;
        Config.API_KEY        = config.apiKey || Config.API_KEY;
        Config.DISCOVERY_DOCS = config.discoveryDocs || Config.DISCOVERY_DOCS;
        Config.SCOPES         = config.scopes || Config.SCOPES;
        Config.UPLOAD_API_URL = config.uploadApiUrl || Config.UPLOAD_API_URL;
        Config.FOLDER_NAME    = config.folderName || Config.FOLDER_NAME;
    }
    
    renderDriveButton(config) {
        if(document.querySelector('[data-gdm="button"]'))
        {
            this.button = document.querySelector('[data-gdm="button"]');
            if(this.button.getAttribute('data-gdm-folder') != "") {
                Config.FOLDER_NAME = this.button.getAttribute('data-gdm-folder');
            }
        }
        else if(document.querySelector('[rel="render-drive-button"]'))
        {
            this.button = this.createElement("button", {
                "type": "button",
                "class": config.button.class,
                "style": config.button.style,
                "innerHTML": config.button.innerHTML
            });
            
            document.querySelector('[rel="render-drive-button"]').appendChild(this.button);        
        }
    }
    
    loadGoogleApi () {
        this.loadScript(Config.API_URL, this.handleClientLoad);
    }
    
    handleClientLoad() {
        gapi.load('client:auth2', () => {
            gapi.client.init({
                apiKey: Config.API_KEY,
                clientId: Config.CLIENT_ID,
                discoveryDocs: Config.DISCOVERY_DOCS,
                scope: Config.SCOPES
            }).then( () => {
                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen(() => {
                    this.updateSigninStatus.call(this, gapi.auth2.getAuthInstance().isSignedIn.get())
                });
                // Handle the initial sign-in state.
                this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            }, (error) => {
                console.error(error);
            });
        });
    }
    
    updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            const user = gapi.auth2.getAuthInstance().currentUser.get();
            const oauthToken = user.getAuthResponse().access_token;
            localStorage.setItem("oauthToken", oauthToken);
            if(window.eventListenerExists) 
            {
                this.button.removeEventListener("click", this.handleAuthClick);
            }
            if (this.button)
            {
                this.button.addEventListener("click", () => {
                    this.openModal();
                });
            }
        } else {
            this.button.addEventListener("click", this.handleAuthClick);
        }
    }
    
    async handleAuthClick(event) {
        window.eventListenerExists = true;
        await gapi.auth2.getAuthInstance().signIn();
        new GoogleApi().openModal();
    }
    
    async openModal() {
        let modal = new Modal(this.modal);
        modal.show();
        
        if(modal._isShown) {
            this.loadSpinner(this.selector);
            
            localStorage.setItem("nextPageToken", "");
            const files = await this.listFiles();

            if(files.length < 12) document.getElementById('load-more').style.display = "none";
            
            this.showListFile(this.selector, files);
            const modalBody = document.querySelector(this.selector);
            modalBody.innerHTML = "";
            modalBody.appendChild(this.container);
        }
    }
    
    async listFiles() {
        
        const folder = await this.chooseFolder();
        
        let body = {
            'q': `mimeType != 'application/vnd.google-apps.folder' and trashed = false and '${folder.id}' in parents`,
            'pageSize': 12,
            'fields': "nextPageToken, files(id, name, thumbnailLink, iconLink, webContentLink)"
        };
        
        let pageToken = localStorage.getItem("nextPageToken");
        if(pageToken != "") body.pageToken = pageToken;
        
        const response = await gapi.client.drive.files.list(body)
        
        localStorage.setItem("nextPageToken", response.result.nextPageToken)
        
        var files = response.result.files;
        
        return files;
    }
    
    async getFile(id) {
        const response = await gapi.client.drive.files.get({
            'fileId': id,
            'fields': "*"
        });
        return response.result;
    }
    
    async resumableUpload(file, locationUrl) {
        const contentType = file.type || 'application/octet-stream';
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                fetch(locationUrl, {
                    method: "PUT",
                    headers: {
                        'Content-Type': contentType,
                        'X-Upload-Content-Type': contentType
                    },
                    body: reader.result
                }).then(resp => {
                    var data = resp.json();
                    resolve(data);
                })
                .catch(err => {
                    console.error(err)
                });
            };
            reader.readAsArrayBuffer(file);
        });
    }
        
    async getFolder(name) {
        
        let body = {
            'q': `mimeType='application/vnd.google-apps.folder' and name='${name}'`
        };
        
        const response = await gapi.client.drive.files.list(body)
        
        var folder = response.result.files;

        return folder.length > 0 ? folder[0] : false;
    }
    
    async createFolder(name) {        
        const fileMetadata = {
            'name': name,
            'mimeType': 'application/vnd.google-apps.folder'
        };
        const response = await gapi.client.drive.files.create({
            resource: fileMetadata
        });
        
        const folder = response.result;
        
        return folder;
    }

    async chooseFolder() {
        let folderInfo;
        const getFolder = await this.getFolder(Config.FOLDER_NAME);
        if(!getFolder) {
            const folder = await this.createFolder(Config.FOLDER_NAME);
            folderInfo = folder;
        } else {
            folderInfo = getFolder;
        }
        localStorage.setItem("folderId", folderInfo.id);
        return folderInfo;
    }
}