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
  
  if (!net.tschmid.secondopinion.Logger)
    throw "Failed to import logger";
  
  var logger = net.tschmid.secondopinion.Logger;  
  
  if (!net.tschmid.secondopinion.settings)
    throw "Failed to import settings";
  
  var settings = net.tschmid.secondopinion.settings;    
  
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

    logger.logDebug(report);
    
    this._hasError = false;
    this._hasReport = true;
    this._isPending = false;
    
    this._url = report["address"];
    this._link = "https://live.metascan-online.com/#!/results/ip/"+window.btoa(this._url);

    // We need to calculate the positives by our own...
    var total = 0;
    var positives = 0;
    
    var excluded = settings.getExcluded(); 
    
    report["scan_results"].forEach( function(item) {
      
      if(excluded.indexOf(item["source"]) !== -1) {
        logger.logDebug("Excluding results from "+item["source"]);
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

    
    /*var keys = Object.keys(report);
  
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
    this._total = total;*/       
    
    //return this;      
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
      logger.logDebug(data["err"]);
      return [];
    }
    
    if (!Array.isArray(data)) {
      logger.logDebug("Array expected");
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
      if (!this.getSettings().isMetascanEnabled())
        return;
      
      var address = {};      
      
      if (!Array.isArray(urls))        
        urls = [urls];          
        
      address["address"] = urls;
        
      var request = new XMLHttpRequest();
    
      var self = this;
      request.onload = function(e) {
        self.getRequests().remove(ENGINE_METASCAN, urls);
        
        logger.logDebug(this.responseText);
        var response = (new MetascanUrlResponse()).parse(this);

        callback(urls, response);
      };
      
      // Convert to string
      address = JSON.stringify(address);
      
      request.open("POST",this.ADDRESS_URL_REPORT);
      request.setRequestHeader("apikey",this.getSettings().getMetascanApiKey());      
      request.send(address);
    
      this.getRequests().add(ENGINE_METASCAN, urls, request);
    },   

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

  if (!exports.net.tschmid.secondopinion.metsacan)
    exports.net.tschmid.secondopinion.metascan = {};
    
  exports.net.tschmid.secondopinion.metascan.url = new MetascanUrlRequest();    
  
  
  
  if (!exports.net.tschmid.secondopinion.engine)
    exports.net.tschmid.secondopinion.engine = [];
  
  if (!exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN])
    exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN] = [];
    
  if (!exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN][ENGINE_TYPE_URL])
    exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN][ENGINE_TYPE_URL] = {};   
    
  exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN][ENGINE_TYPE_URL].api 
      = exports.net.tschmid.secondopinion.metascan.url;
      
  exports.net.tschmid.secondopinion.engine[ENGINE_METASCAN][ENGINE_TYPE_URL].Report 
      = MetascanUrlReport;        
    
}(window));
