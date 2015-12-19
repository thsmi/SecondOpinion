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
  
  VirusTotalFileReport.prototype.getPrettyName = function() {
  	return this.getFilename();
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
  
    _createRequest : function() {
      return new net.tschmid.secondopinion.Request();
    },
    
    _createResponse : function() {
      return new VirusTotalFileResponse();
    },    
    
    // Scans the attachment urls passed.  
    uploadFile : function(name, chunks, onCompleted, onProgress) {

   	  var SETTINGS = net.tschmid.secondopinion.SETTINGS;   

      // Check if VirusTotal is enabled...
      if (!SETTINGS.isVirusTotalEnabled())
        return;
        
      var filename = name;

      if (SETTINGS.isNameObfuscated())
        filename = Math.random().toString(36).slice(2);
      
      var blob = new File(chunks, filename, { type: "application/octet-stream"} );
    
      var formData = new FormData();  
      formData.append("file", blob);
      formData.append("apikey",SETTINGS.getVirusTotalApiKey());
    
      var request = this._createRequest();
    
      request
        .setCompletedHandler( function (response) { onCompleted(name, response); })
        .setUploadProgressHandler( function(event) { onProgress(name, event); } )
        .send( "POST", this.ADDRESS_FILE_UPLOAD, formData );       
    },

    getFileReport : function(name, checksum, callback) {
  
    	var SETTINGS = net.tschmid.secondopinion.SETTINGS;    

      // Check if VirusTotal is enabled...
      if (!SETTINGS.isVirusTotalEnabled())
        return;
      
      var formData = new FormData();
      formData.append( "resource", checksum );
      formData.append( "apikey", SETTINGS.getVirusTotalApiKey() );

      var that = this;
      var onCompleted = function(response) {
        response = (that._createResponse()).parse(response); 
        callback( name, checksum, response );
      };

      var request = this._createRequest();

      request
        .setCompletedHandler( onCompleted )
        .send( "POST", this.ADDRESS_FILE_REPORT, formData );
        
    },

    getEngine : function() {
      return ENGINE_VIRUSTOTAL;
    },
    
    getType : function() {
      return ENGINE_TYPE_FILE;
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
    
  exports.net.tschmid.secondopinion.virustotal.FILE = new VirusTotalFileRequest(); 
  exports.net.tschmid.secondopinion.virustotal.file = exports.net.tschmid.secondopinion.virustotal.FILE;
  
  
  if (!exports.net.tschmid.secondopinion.engine)
    exports.net.tschmid.secondopinion.engine = [];
  
  if (!exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL])
    exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL] = [];

  if (!exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL][ENGINE_TYPE_FILE])
    exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL][ENGINE_TYPE_FILE] = {};
    
  exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL][ENGINE_TYPE_FILE].API 
      = exports.net.tschmid.secondopinion.virustotal.file;  
    
  exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL][ENGINE_TYPE_FILE].Report
      = VirusTotalFileReport;  
  
}(this));
