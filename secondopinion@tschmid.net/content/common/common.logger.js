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
  /* global Components */
  
  var Ci = Components.interfaces;
  var Cc = Components.classes;
  
  function SecondOpinionLogger() {}

  SecondOpinionLogger.prototype = { 
  
    level  : null,

	  log : function(str, logLevel) {
      if (this.level === null)
        this.level = this.getSettings().getLogLevel();
	 
	    if (this.level < logLevel)
        return;
	 	  
      Cc["@mozilla.org/consoleservice;1"]
	      .getService(Ci.nsIConsoleService)
		  .logStringMessage("[SecondOpinion "+this.getTimestamp()+"]\n"+str);		
	  },
	  
	  logError : function(str) {
	  	Components.utils.reportError(str);
	  },
	
    logWarn : function(str) {
	    this.log(str, 1);
	  },
    
    logInfo : function(str) {
	    this.log(str, 2);
    },
    
    logDebug : function(str) {
	    this.log(str,3);
    },
		
	  getTimestamp : function() {
	  
	    function _pad(n,m) {
        var str = n;
        
        for (var i = 0; i < m; i++)
          if (n < Math.pow(10,i))
            str = '0'+str;
        
        return str; 		  
	    }
		
      var date = new Date();	  
      
	    return ""+_pad(date.getHours(),2)
        + ":"+_pad(date.getMinutes(),2)
        + ":"+_pad(date.getSeconds(),2)
        + "."+_pad(date.getMilliseconds(),3);
    },
        
    // Api short cuts ...   
    getSettings : function () {
      if (!net.tschmid.secondopinion.SETTINGS)
        throw "Failed to import settings";
    
      return net.tschmid.secondopinion.SETTINGS;
    }  
  };
  
  if (!exports.net)
    exports.net = {};

  if (!exports.net.tschmid)
    exports.net.tschmid = {};

  if (!exports.net.tschmid.secondopinion)
    exports.net.tschmid.secondopinion = {};
  
  exports.net.tschmid.secondopinion.LOGGER = new SecondOpinionLogger();

}(this));  