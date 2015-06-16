"use strict";

var net = net || {};

if (!net.tschmid)
  net.tschmid = {};

if (!net.tschmid.secondopinion)
  net.tschmid.secondopinion = {};


(function() {
  function SecondOpinionUrl() {}

  SecondOpinionUrl.prototype = {

    ADDRESS_URL_REPORT  : "https://www.virustotal.com/vtapi/v2/url/report",
  
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
    getUrlReport : function(url, callback, apikey) {
    
      let resource = url;
    
      if (Array.isArray(url)) {   
      
        if (!url.length)
          return;
    
        resource = "";
    
        url.forEach(function(item) {
          resource += item +"\n"
        } );
      }
    
      if (!apikey)
        apikey = this.getSettings().getApiKey();
    
      let formData = new FormData();
    
      formData.append("resource", resource);
      formData.append("scan", 1);
      formData.append("apikey", apikey);
    
      let request = new XMLHttpRequest();
    
      let self = this;
      request.onload = function(e) {
        self.getRequests().remove(url);
        callback(url, this)
      };
    
      request.open("POST",this.ADDRESS_URL_REPORT);
      request.send(formData);
    
      this.getRequests().add(url, request);
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
    },  
  }
  
  // Export an instance to the global Scope  
  net.tschmid.secondopinion.url = new SecondOpinionUrl();     
}());