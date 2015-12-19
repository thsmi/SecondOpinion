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
  
  function AbstractReport() {

    this._hasError = true;
    this._hasReport = false;    
    this._isPending = false;
    
    this._resource = "";
    
    this._total = -1;
    this._positives = 0;
    
    this._link = "";
  }
  
  AbstractReport.prototype = {
    
    getEngine :function() {
      throw new Error("Implement getEngine");
    },
    
    getType : function() {
      throw new Error("Implement getType");
    },
    
    getResource : function() {
      throw new Error("Implement getResource");
    },    
    
    isPending : function() {
      return this._isPending;
    },
    
    hasError : function() {
      return this._hasError;
    },
    
    hasReport : function() {
      return this._hasReport;
    },
       
    loadByRow : function(report) {
      
       this._hasError = false;
       this._hasReport = true;
       this._isPending = report["pending"];
       
       this._resource = report["resource"];
              
       this._positives = report["positives"];
       this._total = report["total"];
       this._link = report["link"];    
       
       return this;
    },
    
    loadByResponse : function(report) {
     
      throw new Error("Implement loadByResponse");
    },    
     
    
    /**
     * The link to the scan result.
     * 
     * @returns {String}
     *   a link which points to the scan results.
     */
    getLink : function () {
      return this._link;
    },   
    
    /**
     * Returns the number of positives positives
     * 
     *  @returns {int}
     *    the number of positives or -1 if unknown.
     */
    getPositives : function () {
      
      if (this.isPending())
        return -1;
      
      if (this._positives === null || this._positives < 0)   
        return -1;
         
      return this._positives;
    },
    
    /**
     * The total number of scan engines used
     * 
     *  @returns {int}
     *    the number of scan engines or -1 if unknown.
     */
    getTotal : function () {
      
      if (this.isPending())
        return -1;
      
      if (this._total === null || this._total < 0)
        return -1;
          
      return this._total;
    }
    
  };
  
  if (!exports.net)
    exports.net = {};
    
  if (!exports.net.tschmid)
    exports.net.tschmid = {};

  if (!exports.net.tschmid.secondopinion)
    exports.net.tschmid.secondopinion = {};
    
  if (!exports.net.tschmid.secondopinion.common)
    exports.net.tschmid.secondopinion.common = {};    
    
  // Export an instance to the global Scope  
  exports.net.tschmid.secondopinion.common.AbstractReport = AbstractReport;      
    
}(this));  