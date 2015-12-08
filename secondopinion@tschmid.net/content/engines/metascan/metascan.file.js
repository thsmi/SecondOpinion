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

// Add option to test if batch upload is possible and the maximal batch length
//
// virus total sppors file batches, whith metascan file batches are useless.
// but ulrs can be batches whil this is not possible with virustotal

(function(exports) {
  
  /* global XMLHttpRequest */
  /* global Blob */
  /* global FormData */
  /* global net */
  
  var ENGINE_METASCAN = 2;
  var ENGINE_TYPE_FILE  = 2;    
  
  if (!net.tschmid.secondopinion.Logger)
    throw "Failed to import logger";
  
  var logger = net.tschmid.secondopinion.Logger;  
  
  if (!net.tschmid.secondopinion.settings)
    throw "Failed to import settings";
  
  var settings = net.tschmid.secondopinion.settings;  
  
  var AbstractReport = net.tschmid.secondopinion.common.AbstractReport;
  var AbstractResponse = net.tschmid.secondopinion.metascan.AbstractResponse;  
  
  //---------------------------------------------------------------------------------
  
  function MetascanFileReport() {
    AbstractReport.call(this);
  }
  
  MetascanFileReport.prototype = Object.create(AbstractReport.prototype);
  MetascanFileReport.prototype.constructor = MetascanFileReport; 

  MetascanFileReport.prototype.loadByRow 
    = function(report) {
    
    AbstractReport.prototype.loadByRow.call(this, report);
    
    this._resource = report["resource"];
    
    return this;
  };
  
  
  MetascanFileReport.prototype.loadByResponse = function(report) {
    
    var keys = Object.keys(report);
    
    logger.logDebug(report);
        
    if ((Object.keys(report).length === 1) && (report[Object.keys(report)[0]] === "Not Found")) {
      this._hasError = false;
      return this;      
    }
    
    if (!report["data_id"] || !report["file_info"] || !report["scan_results"])
      return this;
      
    this._hasError = false;
    this._hasReport = true; 
    
    // Pending 
    if (report["scan_results"]["progress_percentage"] !== 100)
      this._isPending = true;
      
    // Link...
    this._link = "https://www.metascan-online.com/#!/results/file/"+report["data_id"]+"/regular";    
    
    // The resource upl...
    this._resource = report["file_info"]["sha256"].toLowerCase();    
    
    
    
    // We need to calculate the positives by our own...
    var total = 0;
    var positives = 0;
    
    var excluded = settings.getExcluded(); 
    
    for (var key in report["scan_results"]["scan_details"]) {
      
      if (excluded.indexOf(key) !== -1) {
        logger.logDebug("Excluding results from "+key);
        continue;
      }
      
      total++;
            
      var item = report["scan_results"]["scan_details"][key];
      
      if (item["scan_result_i"] !== 0)
        positives++;    
    }
    
    this._positives = positives;
    this._total = total;       
    
    return this;
  };     
 

  MetascanFileReport.prototype.getResource = function() {
    return this._resource;
  };        
    
  MetascanFileReport.prototype.setFilename = function(filename) {
    this._filename = filename;
  };    
    
  MetascanFileReport.prototype.getFilename = function() {
    return this._filename;
  };    
    
  MetascanFileReport.prototype.getEngine = function() {
    return ENGINE_METASCAN;
  };
    
  MetascanFileReport.prototype.getType = function() {
    return ENGINE_TYPE_FILE;
  };  
  
  //--------------------------------------------------------------------------------- 

  function MetascanFileResponse() {        
    AbstractResponse.call(this);
  }
  
  MetascanFileResponse.prototype = Object.create(AbstractResponse.prototype);
  MetascanFileResponse.prototype.constructor = MetascanFileResponse;  
  
  MetascanFileResponse.prototype.createReports = function(data) {    
    return [(new MetascanFileReport()).loadByResponse(data)];
  };
  
  //---------------------------------------------------------------------------------
  
  function MetascanFileRequest() {}

  MetascanFileRequest.prototype = {  
    
    //    "https://hashlookup.metascan-online.com/v2/hash/E71A6D8760B37E45FA09D3E1E67E2CD3"
    ADDRESS_FILE_REPORT : "https://hashlookup.metascan-online.com/v2/hash/",
    ADDRESS_FILE_UPLOAD : "https://scan.metascan-online.com/v2/file",
  
    // Scans the attachment urls passed.  
    uploadFile : function(name, chunks, onCompleted, onProgress) {
      
      var filename = name;

      if (this.getSettings().isNameObfuscated())
        filename = Math.random().toString(36).slice(2);
      
      var blob = new Blob(chunks);    
    
      var request = new XMLHttpRequest();    
    
      var self = this;
      request.onload = function(event) {        
        self.getRequests().remove(ENGINE_METASCAN, name);
        
        logger.logDebug(this.responseText);
        
        onCompleted(name, this); 
      };
    
      request.upload.onprogress = function(event) { onProgress(name, event); };
      
      request.open("POST",this.ADDRESS_FILE_UPLOAD);
      request.setRequestHeader("filename", filename);
      request.setRequestHeader("apikey",this.getSettings().getMetascanApiKey());
      
      request.send(blob);   
    
      this.getRequests().add(ENGINE_METASCAN, name, request);
    },

    
    getFileReport : function(name, checksum, callback) {

      // Check if Metascan is enabled...
      if (!this.getSettings().isMetascanEnabled())
        return;      
      
      // Ensure the checksum is upper case...
      checksum = checksum.toLowerCase();       

      var request = new XMLHttpRequest();
  
      var self = this;
      request.onload = function(e) {
        self.getRequests().remove(ENGINE_METASCAN, checksum);
        
        logger.logDebug(this.responseText);        
        
        var response = (new MetascanFileResponse()).parse(this);
        callback(name, checksum, response);
      };
  
      request.open("GET",""+this.ADDRESS_FILE_REPORT+checksum);
      request.setRequestHeader("apikey",this.getSettings().getMetascanApiKey());
      
      request.send(null);      
      
      this.getRequests().add(ENGINE_METASCAN, checksum, request);
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
    
  if (!exports.net.tschmid.secondopinion.metascan)
    exports.net.tschmid.secondopinion.metascan = {};
    
  exports.net.tschmid.secondopinion.metascan.file = new MetascanFileRequest(); 
   
  
  
  if (!exports.net.tschmid.secondopinion.engine)
    exports.net.tschmid.secondopinion.engine = [];
  
  if (!exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN])
    exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN] = [];

  if (!exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN][ENGINE_TYPE_FILE])
    exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN][ENGINE_TYPE_FILE] = {};
    
  exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN][ENGINE_TYPE_FILE].api 
      = exports.net.tschmid.secondopinion.metascan.file;  
    
  exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN][ENGINE_TYPE_FILE].Report
      = MetascanFileReport;       
  
}(this));  
