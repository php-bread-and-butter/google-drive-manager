"use strict";
import GoogleApi from "./google-api";
import initiateModal from "./initiate.modal";
const googleApi = new GoogleApi();

export default function BootStrap() {

  this.init = function(config) {
    googleApi.init(config);
    initiateModal();
  }
}