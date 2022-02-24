"use strict";

import Config from './config.json';
import GoogleApi from './google-api';

export default class DriveManager {
    
    async uploadFile() {
        const googleApi = new GoogleApi();
        const file = this.files[0];
        const contentType = file.type || 'application/octet-stream';
        const oauthToken = localStorage.getItem("oauthToken");
        
        const noitemPlaceholder = document.getElementById("no-items");
        if(noitemPlaceholder) noitemPlaceholder.remove();

        const filePreview = await googleApi.showPlaceHolder(googleApi.selector, file);
        try {
            const folderId = localStorage.getItem("folderId");
            const response = await fetch(Config.UPLOAD_API_URL, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${oauthToken}`,
                    'Content-Type': 'application/json;charset=utf-8',
                    'X-Upload-Content-Length': file.size,
                    'X-Upload-Content-Type': contentType
                },
                body: JSON.stringify({
                    'name': file.name,
                    'mimeType': contentType,
                    'Content-Type': contentType,
                    'Content-Length': file.size,
                    'parents': [folderId]
                })
            });
            
            const locationUrl = response.headers.get('Location');
            
            const data = await googleApi.resumableUpload(file, locationUrl);
            
            const getFile = await googleApi.getFile(data.id);
            
            googleApi.appendFile(filePreview, getFile);
            
        } catch (error) {
            console.error(error);
        }
    }
    
    async loadMore() {
        const googleApi = new GoogleApi();
        const files = await googleApi.listFiles();

        if(files.length < 12) document.getElementById('load-more').style.display = "none";
        
        googleApi.showListFile(googleApi.selector, files);
        
        const modalBody = document.querySelector(googleApi.selector);
        modalBody.appendChild(googleApi.container);
        setTimeout(() => {
            document.querySelector(googleApi.modal).scrollTo(0, modalBody.scrollHeight);
        }, 300);
    }
    
    async createFolder() {
        const googleApi = new GoogleApi();
        const folder = await googleApi.createFolder('Invoices');
    }
}