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
  /* global URL */
  
  /* global XMLHttpRequest */
  /* global FormData */  
  
  // Imports
  var VirusTotalAbstractReport = net.tschmid.secondopinion.virustotal.AbstractReport;
  var AbstractResponse = net.tschmid.secondopinion.virustotal.AbstractResponse;
  
  var ENGINE_VIRUSTOTAL = 1;
  var ENGINE_TYPE_URL   = 1;
  
  if (!net.tschmid.secondopinion.LOGGER)
    throw "Failed to import LOGGER";
  
  var LOGGER = net.tschmid.secondopinion.LOGGER;  
    

  //---------------------------------------------------------------------------------    
  
  function VirusTotalUrlReport() {    
    VirusTotalAbstractReport.call(this);    
    this._url = "";    
  }
  
  VirusTotalUrlReport.prototype = Object.create(VirusTotalAbstractReport.prototype);
  VirusTotalUrlReport.prototype.constructor = VirusTotalUrlReport; 
  
  VirusTotalUrlReport.prototype.loadByRow 
    = function(report) {
    
    VirusTotalAbstractReport.prototype.loadByRow.call(this, report);
    
    this._url = report["resource"];  
    
    return this;
  };  
  
  VirusTotalUrlReport.prototype.loadByResponse = function(report) {
      
    LOGGER.logDebug("URL Report"+report);   
    
    VirusTotalAbstractReport.prototype.loadByResponse.call(this, report);
      
    if (!this.hasReport())
      return this;
         
    this._url = report["url"];
      
    return this;       
  };
    
  VirusTotalUrlReport.prototype.getResource = function() {
    return this.getOrigin();
  };
    
  VirusTotalUrlReport.prototype.getUrl = function() {
    return this._url;
  };
    
  VirusTotalUrlReport.prototype.getOrigin = function() {
    return (new URL(this.getUrl())).origin;
  };
    
  VirusTotalUrlReport.prototype.getEngine = function() {
    return ENGINE_VIRUSTOTAL;
  };
    
  VirusTotalUrlReport.prototype.getType = function() {
    return ENGINE_TYPE_URL;
  };
    
  //---------------------------------------------------------------------------------  
  
  // We have multiple and concurrent request running at the same time...
  // ... this so we should keep track of them...

  function VirusTotalUrlResponse() {        
    AbstractResponse.call(this);    
  }
  
  VirusTotalUrlResponse.prototype = Object.create(AbstractResponse.prototype);
  VirusTotalUrlResponse.prototype.constructor = VirusTotalUrlResponse;

  VirusTotalUrlResponse.prototype.createReport = function(data) {
    return (new VirusTotalUrlReport()).loadByResponse(data);
  };
  
  //---------------------------------------------------------------------------------  
  
  function VirusTotalUrlRequest() {}

  VirusTotalUrlRequest.prototype = {

    ADDRESS_URL_REPORT  : "https://www.virustotal.com/vtapi/v2/url/report",    
   
    /**
     * Requests an Report at virus total for the given URL.
     *
     *  @param{String|String[]} url
     *    an url or and array of urls as string
     *  
     *  @param{callback(url, request)} callback
     *    the callback which should be invoked when the reponse is received.
     *    the url parameter is passed transparently to the callback.   
     **/   
    getUrlReport : function(urls, callback) {
      
      // Check if VirusTotal is enabled...
      if (!this.getSettings().isVirusTotalEnabled())
        return;
            
      var that = this;
      
      // Virus total supports batch request with upto four urls. 
      // This means we may need to split the request into chunks.
      if( Array.isArray(urls) && (urls.length > 4)) {
        
        var batch = [];
    
        urls.forEach( function (item) {        
    
          batch.push(item);
      
          if (batch.length < 4) 
            return;
      
          that.getUrlReport( batch, callback );
          batch = [];   
        } );
        
        this.getUrlReport( batch, callback );
        return;
      }
    
      // Normalize single items into an array.
      if (!Array.isArray(urls)) 
        urls = [urls];
      
      if (urls.length === 0)
        return;
    
      var resource = "";
    
      urls.forEach(function(item) {
        resource += item +"\n";
      } );
       
      var formData = new FormData();
    
      formData.append("resource", resource);
      formData.append("scan", 1);
      formData.append("apikey", this.getSettings().getVirusTotalApiKey());
    
    
      var onCompleted = function( response ) {        
        response = (new VirusTotalUrlResponse()).parse(response);     
        callback( urls, response );
      };
    
      var request = new net.tschmid.secondopinion.Request("POST");
      request
        .setCompletedHandler( onCompleted )
        .send(this.ADDRESS_URL_REPORT, formData);  
        
    },   

    getSettings : function () {
      if (!net.tschmid.secondopinion.SETTINGS)
        throw "Failed to import settings";
  
      return net.tschmid.secondopinion.SETTINGS;
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
    
  exports.net.tschmid.secondopinion.virustotal.URL = new VirusTotalUrlRequest(); 
   
  
  
  if (!exports.net.tschmid.secondopinion.engine)
    exports.net.tschmid.secondopinion.engine = [];
  
  if (!exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL])
    exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL] = [];

  if (!exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL][ENGINE_TYPE_URL])
    exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL][ENGINE_TYPE_URL] = {};
    
  exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL][ENGINE_TYPE_URL].API 
      = exports.net.tschmid.secondopinion.virustotal.URL;  
    
  exports.net.tschmid.secondopinion.engine[ENGINE_VIRUSTOTAL][ENGINE_TYPE_URL].Report
      = VirusTotalUrlReport;  

}(this));