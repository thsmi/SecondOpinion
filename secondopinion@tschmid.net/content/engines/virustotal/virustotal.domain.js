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


(function (exports) {
  
  /* global XMLHttpRequest */
  
  function SecondOpinionDomain() {}

  SecondOpinionDomain.prototype = {	
  
   /**
	  * Requests an Report at virus total for the given Domain.
	  *
	  *  @param{String} domain
	  *    an domain as string e.g. 027.ru
    *  
    *  @param{callback(url, request)} callback
    *    the callback which should be invoked when the reponse is received.
    *    the url parameter is passed transparently to the callback.	 
    **/	     
    getDomainReport : function(domain, callback) {
    	  
      var url = "https://www.virustotal.com/vtapi/v2/domain/report";
      url += "?domain=" + encodeURIComponent(domain);
      url += "&apikey=" + encodeURIComponent(this.getSettings().getVirusTotalApiKey());        
       
      var request = new XMLHttpRequest();
	  
	    var self = this;
      request.onload = function(e) {
	      self.getRequests().remove(domain);
	      callback(domain, this);
      };
	  
      request.open("GET",url);
      request.send();
	  
	    this.getRequests().add(domain, request);
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
  
  // Export an instance to the global Scope  
  net.tschmid.secondopinion.domain = new SecondOpinionDomain();

  
}(this));
