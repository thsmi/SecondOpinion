"use strict";

var net = net || {};

if (!net.tschmid)
  net.tschmid = {};

if (!net.tschmid.secondopinion)
  net.tschmid.secondopinion = {};

(function() {
  function SecondOpinionFiles() {}

  SecondOpinionFiles.prototype = {			
  
    // Scans the attachment urls passed.  
    uploadFile : function(name, chunks, onCompleted, onProgress) {

      let filename = name;

      if (this.getSettings().isNameObfuscated())
        filename = Math.random().toString(36).slice(2);
      
	  var blob = new File(chunks, filename, { type: "application/octet-stream"} );
	  
      var formData = new FormData();	
	  formData.append("file", blob);
	  formData.append("apikey",this.getSettings().getApiKey());
	  
      var request = new XMLHttpRequest();
	  
	  var self = this;
      request.onload = function(event) { 
	    self.getRequests().remove(name);
	    onCompleted(name, this); 
	  };
	  
	  request.upload.onprogress = function(event) {onProgress(name, event)};
      request.open("POST","https://www.virustotal.com/vtapi/v2/file/scan");
	  request.send(formData);   
	  
	  this.getRequests().add(name,request);
    },

	getFileReport : function(name, checksum, callback) {
  
      let formData = new FormData();
      formData.append("resource",checksum);
      formData.append("apikey",this.getSettings().getApiKey());

      let request = new XMLHttpRequest();
	
	  let self = this;
      request.onload = function(e) {
	    self.getRequests().remove(checksum);
	    callback(name, checksum, this)
      };
	
      request.open("POST","https://www.virustotal.com/vtapi/v2/file/report");
      request.send(formData);
	
	  this.getRequests().add(checksum, request);
    }, 

    // Api short cuts ...	
    getSettings : function () {
	  if (!net.tschmid.secondopinion.settings)
	    throw "Failed to import settings";
	
	  return net.tschmid.secondopinion.settings;
	},
	
    getRequests : function() {
	  if (!net.tschmid.secondopinion.requests)
	    throw "Failed to import requests";
	
	  return net.tschmid.secondopinion.requests;	
	},
  }
  
  // Export an instance to the global Scope  
  net.tschmid.secondopinion.files = new SecondOpinionFiles();  	
  
}());  