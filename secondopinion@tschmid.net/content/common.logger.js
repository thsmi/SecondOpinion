"use strict";

if (!Ci)
  var Ci = Components.interfaces;
if (!Cc)
  var Cc = Components.classes;


var net = net || {};

if (!net.tschmid)
  net.tschmid = {};

if (!net.tschmid.secondopinion)
  net.tschmid.secondopinion = {};

(function() {
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
      if (!net.tschmid.secondopinion.settings)
        throw "Failed to import settings";
    
      return net.tschmid.secondopinion.settings;
    },  
  }
  
  // Export an instance to the global Scope  
  net.tschmid.secondopinion.logger = new SecondOpinionLogger();     
}());  