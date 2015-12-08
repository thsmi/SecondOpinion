/*
 * The contents of this file are licenced. You may obtain a copy of 
 * the license at https://github.com/thsmi/SecondOpinion/ or request it via 
 * email from the author.
 *
 * Do not remove or change this comment.
 * 
 * The initial author of the code is:
 *   Thomas Schmid <schmid-thomas@gmx.net>
 *      
 */
 
/* global window */

"use strict";

var net = net || {};

if (!net.tschmid)
  net.tschmid = {};

if (!net.tschmid.secondopinion)
  net.tschmid.secondopinion = {};

(function(exports) {
  
  /* global net */
  /* global XMLHttpRequest */
  /* global File */
  /* global FormData */  
  
  // Imports
  var VirusTotalAbstractReport = net.tschmid.secondopinion.virustotal.AbstractReport;  
  var AbstractResponse = net.tschmid.secondopinion.virustotal.AbstractResponse;  

  var ENGINE_VIRUSTOTAL = 1;
  var ENGINE_TYPE_FILE  = 2;  
  
  //---------------------------------------------------------------------------------
  
  function VirusTotalFileReport() {
    
    VirusTotalAbstractReport.call(this);
    
    this._filename = "unknown";
    this._resource = null;
  }
  
  VirusTotalFileReport.prototype = Object.create(VirusTotalAbstractReport.prototype);
  VirusTotalFileReport.prototype.constructor = VirusTotalFileReport; 
  
  VirusTotalFileReport.prototype.loadByRow 
    = function(report) {
    
    VirusTotalAbstractReport.prototype.loadByRow.call(this, report);
    
    this._resource = report["resource"];
    
    return this;
  };
  
  VirusTotalFileReport.prototype.loadByResponse 
    = function(response) {
      
      VirusTotalAbstractReport.prototype.loadByResponse.call(this, response);
           
      if (!this.hasReport())
        return this;      

      if (!response["sha256"])
        throw "Invalid Response no Hash found";
        
      this._resource = response["sha256"];
      
      return this;       
  };

  VirusTotalFileReport.prototype.getResource = function() {
    return this._resource;
  };        
    
  VirusTotalFileReport.prototype.setFilename = function(filename) {
    this._filename = filename;
  };    
    
  VirusTotalFileReport.prototype.getFilename = function() {
    return this._filename;
  };    
    
  VirusTotalFileReport.prototype.getEngine = function() {
    return ENGINE_VIRUSTOTAL;
  };
    
  VirusTotalFileReport.prototype.getType = function() {
    return ENGINE_TYPE_FILE;
  };
    
  //---------------------------------------------------------------------------------
    
  // We have multiple and concurrent request running at the same time...
  // ... this so we should keep track of them...

  function VirusTotalFileResponse() {        
    AbstractResponse.call(this);
  }
  
  VirusTotalFileResponse.prototype = Object.create(AbstractResponse.prototype);
  VirusTotalFileResponse.prototype.constructor = VirusTotalFileResponse;  
  
  VirusTotalFileResponse.prototype.createReport = function(data) {
    return (new VirusTotalFileReport()).loadByResponse(data);
  };
  
  //---------------------------------------------------------------------------------   

  function VirusTotalFileRequest() {}

  VirusTotalFileRequest.prototype = {   
    
    ADDRESS_FILE_UPLOAD : "https://www.virustotal.com/vtapi/v2/file/scan",
    ADDRESS_FILE_REPORT : "https://www.virustotal.com/vtapi/v2/file/report",
  
    // Scans the attachment urls passed.  
    uploadFile : function(name, chunks, onCompleted, onProgress) {

      // Check if VirusTotal is enabled...
      if (!this.getSettings().isVirusTotalEnabled())
        return;
        
      var filename = name;

      if (this.getSettings().isNameObfuscated())
        filename = Math.random().toString(36).slice(2);
      
      var blob = new File(chunks, filename, { type: "application/octet-stream"} );
    
      var formData = new FormData();  
      formData.append("file", blob);
      formData.append("apikey",this.getSettings().getVirusTotalApiKey());
    
      var request = new XMLHttpRequest();
    
      var self = this;
      request.onload = function(event) { 
        self.getRequests().remove(ENGINE_VIRUSTOTAL, name);
        onCompleted(name, this); 
      };
    
      request.upload.onprogress = function(event) { onProgress(name, event); };
      request.open("POST", this.ADDRESS_FILE_UPLOAD);
      request.send(formData);   
    
      this.getRequests().add(ENGINE_VIRUSTOTAL, name, request);
    },

    getFileReport : function(name, checksum, callback) {
  
      // Check if VirusTotal is enabled...
      if (!this.getSettings().isVirusTotalEnabled())
        return;
      
      var formData = new FormData();
      formData.append("resource",checksum);
      formData.append("apikey",this.getSettings().getVirusTotalApiKey());

      var request = new XMLHttpRequest();
  
      var self = this;
      request.onload = function(e) {
        self.getRequests().remove(ENGINE_VIRUSTOTAL, checksum);
        
        var response = (new VirusTotalFileResponse()).parse(this); 
        callback(name, checksum, response);
      };
  
      request.open("POST", this.ADDRESS_FILE_REPORT);
      request.send(formData);
  
      this.getRequests().add(ENGINE_VIRUSTOTAL, checksum, request);
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
    }
  };
  
  if(!exports.net)
    exports.net = {};
    
  if (!exports.net.tschmid)
    exports.net.tschmid = {};

  if (!exports.net.tschmid.secondopinion)
    exports.net.tschmid.secondopinion = {};
    
  if (!exports.net.tschmid.secondopinion.virustotal)
    exports.net.tschmid.secondopinion.virustotal = {};
    
  exports.net.tschmid.secondopinion.virustotal.file = new VirusTotalFileRequest(); 
   
  
  
  if (!exports.net.tschmid.secondopinion.engine)
    exports.net.tschmid.secondopinion.engine = [];
  
  if (!exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL])
    exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL] = [];

  if (!exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL][ENGINE_TYPE_FILE])
    exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL][ENGINE_TYPE_FILE] = {};
    
  exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL][ENGINE_TYPE_FILE].api 
      = exports.net.tschmid.secondopinion.virustotal.file;  
    
  exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL][ENGINE_TYPE_FILE].Report
      = VirusTotalFileReport;  
  
}(this));  