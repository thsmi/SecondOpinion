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
  
  /* global net */
  
  if (!net.tschmid.secondopinion.settings)
    throw "Failed to import settings";
  
  var settings = net.tschmid.secondopinion.settings;
  
  if (!net.tschmid.secondopinion.Logger)
    throw "Failed to import logger";
  
  var logger = net.tschmid.secondopinion.Logger;
   
  /* global XMLHttpRequest */
  /* global FormData */
  
  var AbstractReport = net.tschmid.secondopinion.common.AbstractReport;
  
  function VirusTotalAbstractReport() {
    AbstractReport.call(this);
  }
  
  VirusTotalAbstractReport.prototype = Object.create(AbstractReport.prototype);
  VirusTotalAbstractReport.prototype.constructor = VirusTotalAbstractReport; 
  
  VirusTotalAbstractReport.prototype.loadByResponse = function(report) {
    
    var that = this;
    
    // A response code of 1  indicates everything went fine. Anything else is a fatal error...  
    if ((report["response_code"] !== 1) && (report["response_code"] !== -2) && (report["response_code"] !== 0)) {      
      return this;
    }
    
    this._hasError = false;
    
    // 0 means the file or url is unknown and not classified.
    if ( (report["response_code"] === 0)) {
      return this;
    }    
      
    this._hasReport = true;
    
    // A response code of -2 means still pending in queue so we take a short cut...
    // ... and indicate we don't know this file but it's suspicious.
    if (report["response_code"] === -1) {
      this._isPending = true;
    }   
    
    // Some engines have a really bad quality and return many false positives.
    // We need to exclude those.      
    var excluded = settings.getExcluded();      
      
    excluded.forEach(function(item) {
      
      if ( !item )
        return;
        
      item = item.trim();
              
      if ( !report["scans"] || !report["scans"][item] ) 
        return;
      
      logger.logDebug("Excluding results from "+item);
      
      if (report["scans"][item]["detected"])
        report["positives"] -= 1;
      
      report["total"] -= 1;
    } );      
    
    this._link = report["permalink"];
    
    this._positives = report["positives"];
    this._total = report["total"];
        
    
    return this;
  };    
  
  
  function AbstractError() {    
  }
  
  function InvalidApiKey() {
  }
  
  InvalidApiKey.prototype.getMessage = function() {
    return "Your VirusTotal.com api key is invalid! Open the addon manager and enter a valid key in the extension's options";
  };
  
  
  function QuotaExceeded() {
  }
    
  QuotaExceeded.prototype.getMessage = function() {
      return "The scan result may be incomplete. You reached VirusTotal.com's request quota. It's typically limited to four request per minute. Try later!"; 
  };
  
  
  function ServerError(status) {
    this.status = status;
  }
  
  ServerError.prototype.getMessage = function() {
      return "VirusTotal.com encountered an server error ("+this.status+")";
  };
  
    // We have multiple and concurrent request running at the same time...
  // ... this so we should keep track of them...

  // TODO Rename Response to Report
  function VirusTotalAbstractResponse() {
    this._reports = [];    
  }

  // extends common response
  
  VirusTotalAbstractResponse.prototype = {
    
    parse : function(response) {
      
      this.error = null;
      this.response = null;

      if (response.status == 403) {
        // Show message virus total check could not be completed...
        // ... the apikey is invalid or access forbidden.        
        
        this.error = new InvalidApiKey();        
        return this;
      }
        
      if (response.status == 204) {
        // Show message that rate limit is reached try later...           
        this.error = new QuotaExceeded();       
        return this;
      }
      
      if (response.status != 200) {
        // We ran into a error. Show message...
        this.error = new ServerError(response.status);

        return this;
      }
      
      if (this.getError()) {
        this.getRequestApi().reset();  
        return this;
      }
      
      logger.logDebug(response.responseText);
            
      var reports = JSON.parse(response.responseText);
      
      // Normalize into an array...
      if (!Array.isArray(reports)) {
        logger.logDebug("Normalizing response into an array");
        reports = [reports];
      }
      
      var self = this;
      
      reports.forEach(function (item) {
        logger.logDebug("Creating Report");
        self._reports.push( self.createReport(item) );
      } );     
      
      return this;
    },    
    
   
    getReports : function() {
      return this._reports; 
    },    
    
    getError : function() {
      return this.error;
    }
    
  };  
  
  if (!exports.net)
    exports.net = {};
    
  if (!exports.net.tschmid)
    exports.net.tschmid = {};

  if (!exports.net.tschmid.secondopinion)
    exports.net.tschmid.secondopinion = {};
    
  if (!exports.net.tschmid.secondopinion.virustotal)
    exports.net.tschmid.secondopinion.virustotal = {};    
    
  // Export an instance to the global Scope  
  exports.net.tschmid.secondopinion.virustotal.AbstractReport = VirusTotalAbstractReport;      
    
  // Export an instance to the global Scope  
  exports.net.tschmid.secondopinion.virustotal.AbstractResponse = VirusTotalAbstractResponse;  
    
}(this));  