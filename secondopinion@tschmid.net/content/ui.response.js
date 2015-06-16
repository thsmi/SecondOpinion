"use strict";

var net = net || {};

if (!net.tschmid)
  net.tschmid = {};

if (!net.tschmid.secondopinion)
  net.tschmid.secondopinion = {};

if (!net.tschmid.secondopinion.ui)
  net.tschmid.secondopinion.ui = {};

(function() {
  function SecondOpinionResponseUi() {}

  SecondOpinionResponseUi.prototype = {  
  
    parseResponse : function(response) {

      if (response.status == 403) {
        // Show message virus total check could not be completed...
        // ... the apikey is invalid or access forbidden.
        this.getRequestApi().reset();     
        this.getMessageApi().showError("Your VirusTotal.com api key is invalid! Open the addon manager and enter a valid key in the extension's options");
        
        return null;
      }
        
      if (response.status == 204) {
        // Show message that rate limit is reached try later...
        this.getRequestApi().reset();           
        this.getMessageApi().showError("The scan result may be incomplete. You reached VirusTotal.com's request quota. It's typically limited to four request per minute. Try later!");
        
        return null;
      }
      
      if (response.status != 200) {     
      
        // We ran into a error. Show message...
        this.getRequestApi().reset();      
        this.getMessageApi().showError("VirusTotal.com encountered an server error ("+response.status+")");
   
        return null;
      }
      
      return JSON.parse(response.responseText);
    },
	
	getMessageApi : function() {
	  if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.messages)
	    throw "Failed to import messages";
	
  	  return net.tschmid.secondopinion.ui.messages;
	},	
	
	getRequestApi : function() {
	  if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.requests )
	    throw "Failed to import requests";
	
  	  return net.tschmid.secondopinion.requests;		
	},	
  }
  
  net.tschmid.secondopinion.ui.response = new SecondOpinionResponseUi(); 
  
}());
