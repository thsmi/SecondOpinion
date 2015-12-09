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

(function(exports) {
  
  /* global XMLHttpRequest */
  /* global FormData */
  /* global net */
  /* global URL */  
  
  // Imports
  var AbstractReport = net.tschmid.secondopinion.common.AbstractReport;
  var AbstractResponse = net.tschmid.secondopinion.metascan.AbstractResponse;  
  
  var ENGINE_METASCAN = 2;
  var ENGINE_TYPE_URL = 1;
  
  if (!net.tschmid.secondopinion.LOGGER)
    throw "Failed to import LOGGER";
  
  var LOGGER = net.tschmid.secondopinion.LOGGER;  
  
  if (!net.tschmid.secondopinion.SETTINGS)
    throw "Failed to import SETTINGS";
  
  var SETTINGS = net.tschmid.secondopinion.SETTINGS;    
  
//--------------------------------------------------------------------------------- 
  
  function MetascanUrlReport() {
    AbstractReport.call(this);
  }
  
  MetascanUrlReport.prototype = Object.create(AbstractReport.prototype);
  MetascanUrlReport.prototype.constructor = MetascanUrlReport; 
  
  MetascanUrlReport.prototype.loadByRow 
    = function(report) {
      
    AbstractReport.prototype.loadByRow.call(this, report);
    this._url = report["resource"];
   
    return this;
  };
    
  MetascanUrlReport.prototype.loadByResponse = function(report) {

    LOGGER.logDebug(report);
    
    this._hasError = false;
    this._hasReport = true;
    this._isPending = false;
    
    this._url = report["address"];
    this._link = "https://live.metascan-online.com/#!/results/ip/"+window.btoa(this._url);

    // We need to calculate the positives by our own...
    var total = 0;
    var positives = 0;
    
    var excluded = SETTINGS.getExcluded(); 
    
    report["scan_results"].forEach( function(item) {
      
      if(excluded.indexOf(item["source"]) !== -1) {
        LOGGER.logDebug("Excluding results from "+item["source"]);
        return;       
      }

      total++;

      // The result can be backlisted, whitelisted and unknown
      if (item["results"][0]["result"] === "blacklisted")
        positives++;
    
    });
    
    this._positives = positives;
    this._total = total;
    
    return this; 
  };
    
  MetascanUrlReport.prototype.isValid = function() {
      return this._isValid;
  };
    
  MetascanUrlReport.prototype.getResource = function() {
      return this.getOrigin();
  };
    
  MetascanUrlReport.prototype.getUrl = function() {
    return this._url;
  };
  
  MetascanUrlReport.prototype.getOrigin = function() {
    return (new URL(this.getUrl())).origin;
  };  
    
  MetascanUrlReport.prototype.getEngine = function() {
    return ENGINE_METASCAN;
  };
    
  MetascanUrlReport.prototype.getType = function() {
    return ENGINE_TYPE_URL;
  };
  
  //--------------------------------------------------------------------------------- 

  function MetascanUrlResponse() {        
    AbstractResponse.call(this);
  }
  
  MetascanUrlResponse.prototype = Object.create(AbstractResponse.prototype);
  MetascanUrlResponse.prototype.constructor = MetascanUrlResponse;  
  
  MetascanUrlResponse.prototype.createReports = function(data) {
    
    if (typeof(data["err"]) !== "undefined") {
      LOGGER.logDebug(data["err"]);
      return [];
    }
    
    if (!Array.isArray(data)) {
      LOGGER.logDebug("Array expected");
      return [];
    }
      
    var reports = [];
      
    data.forEach( function(item) {
      reports.push((new MetascanUrlReport()).loadByResponse(item));
    });
      
    return reports;
  };  
  
  //---------------------------------------------------------------------------------
  
  function MetascanUrlRequest() {}

  MetascanUrlRequest.prototype = {
    
    ADDRESS_URL_REPORT  : "https://ipscan.metascan-online.com/v1/scan",
    
  
    /**
     * Requests an Report at virus total for the given URL.
     *
     *  @param{String|String[]} url
     *    an url or and array of urls as string
     *  
     *  @param{callback(url, request)} callback
     *    the callback which should be invoked when the reponse is received.
     *    the url parameter is passed transparently to the callback.   
     *
     *  @optional @param{String} apikey
     *    the api key, in case it is null or omitted it will query the settings for a key.
     **/   
    getUrlReport : function(urls, callback) {
          
      // Check if MetaScan is enabled...
      if (!SETTINGS.isMetascanEnabled())
        return;
      
      var address = {};      
      
      if (!Array.isArray(urls))        
        urls = [urls];          
        
      address["address"] = urls;
            
      var onCompleted = function( response ) {
        response = (new MetascanUrlResponse()).parse(response);
        callback( urls, response );
      };
      
      var request = new (net.tschmid.secondopinion.Request)("POST");
       
      request
        .setCompletedHandler( onCompleted )
        .setHeader( "apikey", SETTINGS.getMetascanApiKey() )     
        .send( this.ADDRESS_URL_REPORT, JSON.stringify(address) );
    }
  };
  
  if(!exports.net)
    exports.net = {};
    
  if (!exports.net.tschmid)
    exports.net.tschmid = {};

  if (!exports.net.tschmid.secondopinion)
    exports.net.tschmid.secondopinion = {};

  if (!exports.net.tschmid.secondopinion.metsacan)
    exports.net.tschmid.secondopinion.metascan = {};
    
  exports.net.tschmid.secondopinion.metascan.URL = new MetascanUrlRequest();    
  
  
  
  if (!exports.net.tschmid.secondopinion.engine)
    exports.net.tschmid.secondopinion.engine = [];
  
  if (!exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN])
    exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN] = [];
    
  if (!exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN][ENGINE_TYPE_URL])
    exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN][ENGINE_TYPE_URL] = {};   
    
  exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN][ENGINE_TYPE_URL].API 
      = exports.net.tschmid.secondopinion.metascan.URL;
      
  exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN][ENGINE_TYPE_URL].Report 
      = MetascanUrlReport;        
    
}(window));
