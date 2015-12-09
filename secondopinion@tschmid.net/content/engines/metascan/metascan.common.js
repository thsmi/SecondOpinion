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
   
  
  function InvalidApiKey() {
  }
  
  InvalidApiKey.prototype.getMessage = function() {
    return "Your Metascan.com api key is invalid! Open the addon manager and enter a valid key in the extension's options";
  };
  
  
  function QuotaExceeded() {
  }
    
  QuotaExceeded.prototype.getMessage = function() {
      return "The scan result may be incomplete. You reached the hourly Metascan limit. Try later!"; 
  };
  
  
  function ServerError(status) {
    this.status = status;
  }
  
  ServerError.prototype.getMessage = function() {
      return "Metascan encountered an server error ("+this.status+")";
  };
  
  function ResponseError(error) {
    this.error = error;
  }
  
  ResponseError.prototype.getMessage = function() {
      return "Metascan returned an error "+this.error;
  };  
  
    // We have multiple and concurrent request running at the same time...
  // ... this so we should keep track of them...

  // TODO Rename Response to Report
  function MetascanAbstractResponse() {
    this._reports = [];    
  }

  // extends common response
  
  MetascanAbstractResponse.prototype = {
    
    parse : function(response) {
      
      this.error = null;
      this.response = null;

      if (response.status == 401) {
        // Show message virus total check could not be completed...
        // ... the apikey is invalid or access forbidden.        
        
        this.error = new InvalidApiKey();        
        return this;
      }
        
      if (response.status == 403) {
        // Show message that rate limit is reached try later...           
        this.error = new QuotaExceeded();       
        return this;
      }
      
      if (response.status != 200) {
        // We ran into a error. Show message...
        this.error = new ServerError(response.status);
        return this;
      }
      
      if (this.getError())
        return this;
            
      // We do not use metascan multiple data hashes api it is too limited.      
      this._reports = this.createReports(JSON.parse(response.responseText));
      
      //this._reports.push( this.createReport(report));
      
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
    
  if (!exports.net.tschmid.secondopinion.metascan)
    exports.net.tschmid.secondopinion.metascan = {};    
        
  // Export an instance to the global Scope  
  exports.net.tschmid.secondopinion.metascan.AbstractResponse = MetascanAbstractResponse;  
    
}(this));  