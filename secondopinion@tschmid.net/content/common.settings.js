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
  function SecondOpinionSettings() {}

  SecondOpinionSettings.prototype = {	
  
    getApiKey : function() {
      let pref = Cc["@mozilla.org/preferences-service;1"]
	                .getService(Ci.nsIPrefBranch);
	  			  
	    let type = pref.getIntPref("extensions.secondopinion.apikey.type");
    
	    if (type != 1) 
	      return pref.getCharPref("extensions.secondopinion.apikey.public");
	    
	    return pref.getCharPref("extensions.secondopinion.apikey.private");	
    },  
	
    /**
     * Returns a list with all excluded scan engines.
     *
     *  @return{String[]} 
     *   returns an array of strings which contains all excluded engines.
     */
    getExcluded : function() {
      
      let pref = Cc["@mozilla.org/preferences-service;1"]
	                  .getService(Ci.nsIPrefBranch);
      
      let excluded = pref.getCharPref("extensions.secondopinion.excluded")      
      if (!excluded)
        return [];
      
      return (new String(excluded)).split(";");
    },
  
    isNameObfuscated : function() {
      let pref = Cc["@mozilla.org/preferences-service;1"]
	                .getService(Ci.nsIPrefBranch)
				  
	  return pref.getBoolPref("extensions.secondopinion.obfuscate");
    },	
	
	  isCacheEnabled : function() {
      let pref = Cc["@mozilla.org/preferences-service;1"]
  	              .getService(Ci.nsIPrefBranch)
      				  
  	  return pref.getBoolPref("extensions.secondopinion.cache");
    },
    
    isAwareOfTermsOfService : function() {
      let pref = Cc["@mozilla.org/preferences-service;1"]
  	              .getService(Ci.nsIPrefBranch)
      				  
  	  return pref.getBoolPref("extensions.secondopinion.termsofservice");
    },
    
    setAwareOfTermsOfService : function() {
      
      let pref = Cc["@mozilla.org/preferences-service;1"]
  	              .getService(Ci.nsIPrefBranch)
      				  
  	  return pref.setBoolPref("extensions.secondopinion.termsofservice", true);      
      
    },   
	
	  getLogLevel : function() {
		
      let pref = Cc["@mozilla.org/preferences-service;1"]
                    .getService(Ci.nsIPrefBranch);
      
      let level = pref.getIntPref("extensions.secondopinion.loglevel");
      
	    if (level == 0)
		    return 0;
	   
	    return level;    
    }
  }
  
  // Export an instance to the global Scope  
  net.tschmid.secondopinion.settings = new SecondOpinionSettings();  	  
}());  