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
  
  /* global Components */
  
  var Ci = Components.interfaces;
  var Cc = Components.classes;
  
  
  function SecondOpinionSettings() {}

  SecondOpinionSettings.prototype = {	
    
    isVirusTotalEnabled : function() {
      var pref = Cc["@mozilla.org/preferences-service;1"]
                  .getService(Ci.nsIPrefBranch);
                
      return pref.getBoolPref("extensions.secondopinion.virustotal.enabled");         
    },
    
  
    /**
     * Returns the api key for VirusTotal.
     * 
     * VirusTotal has two types of key. A public where the quota is enforced by the ip address. 
     * And a private one where the quota is enforce by the key itself.
     */
    getVirusTotalApiKey : function() {
      var pref = Cc["@mozilla.org/preferences-service;1"]
	                .getService(Ci.nsIPrefBranch);
	  			  
	    var type = pref.getIntPref("extensions.secondopinion.virustotal.apikey.type");
    
	    if (type != 1) 
	      return pref.getCharPref("extensions.secondopinion.virustotal.apikey.public");
	    
	    return pref.getCharPref("extensions.secondopinion.virustotal.apikey.private");	
    },  
    
    isMetascanEnabled : function() {
      var pref = Cc["@mozilla.org/preferences-service;1"]
                  .getService(Ci.nsIPrefBranch);
                
      return pref.getBoolPref("extensions.secondopinion.metascan.enabled");      
    },    
    
    /**
     * Returns the stored private api key for Metascan.
     */
    getMetascanApiKey : function() {
      var pref = Cc["@mozilla.org/preferences-service;1"]
                  .getService(Ci.nsIPrefBranch);
      
      return pref.getCharPref("extensions.secondopinion.metascan.apikey"); 
    },      
	
    /**
     * Returns a list with all excluded scan engines.
     *
     *  @return{String[]} 
     *   returns an array of strings which contains all excluded engines.
     */
    getExcluded : function() {
      
      var pref = Cc["@mozilla.org/preferences-service;1"]
	                  .getService(Ci.nsIPrefBranch);
      
      var excluded = pref.getCharPref("extensions.secondopinion.excluded");      
      if (!excluded)
        return [];
      
      return (""+excluded).split(";");
    },
  
    isNameObfuscated : function() {
      var pref = Cc["@mozilla.org/preferences-service;1"]
	                .getService(Ci.nsIPrefBranch);
				  
	    return pref.getBoolPref("extensions.secondopinion.obfuscate");
    },	
	
	  isCacheEnabled : function() {
      var pref = Cc["@mozilla.org/preferences-service;1"]
  	              .getService(Ci.nsIPrefBranch);
      				  
  	  return pref.getBoolPref("extensions.secondopinion.cache");
    },
    
    isAwareOfTermsOfService : function() {
      var pref = Cc["@mozilla.org/preferences-service;1"]
  	              .getService(Ci.nsIPrefBranch);
      				  
  	  return pref.getBoolPref("extensions.secondopinion.virustotal.termsofservice");
    },
    
    setAwareOfTermsOfService : function() {      
      var pref = Cc["@mozilla.org/preferences-service;1"]
  	              .getService(Ci.nsIPrefBranch);
      				  
  	  return pref.setBoolPref("extensions.secondopinion.virustotal.termsofservice", true);            
    },   
	
	  getLogLevel : function() {
		
      var pref = Cc["@mozilla.org/preferences-service;1"]
                    .getService(Ci.nsIPrefBranch);
      
      var level = pref.getIntPref("extensions.secondopinion.loglevel");
      
	    if (level === 0)
		    return 0;
	   
	    return level;    
    },
    
    getMaxWhiteListAge : function() {
      var pref = Cc["@mozilla.org/preferences-service;1"]
                  .getService(Ci.nsIPrefBranch);
            
      return  pref.getIntPref("extensions.secondopinion.whitelist.age");            
    },
    
    getMaxBackListAge : function() {
      var pref = Cc["@mozilla.org/preferences-service;1"]
                  .getService(Ci.nsIPrefBranch);
            
      return pref.getIntPref("extensions.secondopinion.blacklist.age");      
    },
    
    /**
     * By default here the hash is unknown files are considered as safe. 
     */
    isUnknownHashSafe : function() {
      /*var pref = Cc["@mozilla.org/preferences-service;1"]
                  .getService(Ci.nsIPrefBranch);
            
      return pref.getIntPref("extensions.secondopinion.unknown");*/
      return false;
    }
  };
  
  if(!exports)
    throw "No Exports";
  
  if (!exports.net)
    exports.net = {};  
    
  if (!exports.net.tschmid)
    exports.net.tschmid = {};

  if (!exports.net.tschmid.secondopinion)
    exports.net.tschmid.secondopinion = {};
    
  
  // Export an instance to the global Scope  
  exports.net.tschmid.secondopinion.settings = new SecondOpinionSettings();
  exports.net.tschmid.secondopinion.Settings = new SecondOpinionSettings();
 
}(this));
