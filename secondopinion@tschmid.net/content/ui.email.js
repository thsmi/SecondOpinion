"use strict";

var net = net || {};

if (!net.tschmid)
  net.tschmid = {};

if (!net.tschmid.secondopinion)
  net.tschmid.secondopinion = {};

if (!net.tschmid.secondopinion.ui)
  net.tschmid.secondopinion.ui = {};

(function() {
  function SecondOpinionEmailUi() {}

  SecondOpinionEmailUi.prototype = {
      
    loadMessageCallback : null,

    load : function(callback) {
      let self = this;

      this.loadMessageCallback = callback;
      
      let listener = {
        onStartHeaders : function() { },
        onEndHeaders : function() {
          // Release some pressure from the main thread...
          window.setTimeout(function () { self.onEndHeaders() }, 0);
        },
        onEndAttachments : function() { },
      };
    
      gMessageListeners.push(listener);
    },

    unload : function() { },
        
    // Implement the Message Listener interfaces. It notifies 
    // us every time a new Message is loaded and the headers are parsed.
    onEndHeaders: function() {
      
      // We can not start without an MailService object...
      if (!MailServices || !MailServices.headerParser )
        return;
      
      // ... and without a from header
      if (!currentHeaderData || !currentHeaderData['from'] || !currentHeaderData['from'].headerValue)            
        return;
      
      var headers = MailServices.headerParser.parseEncodedHeader(currentHeaderData['from'].headerValue, false);
      
      var urls = new Set();
      
      headers.forEach(function(item) {           
        
        if (!item.email)
          return;
        
        let parts = (new String(item.email)).split("@");
        
        if (parts.length != 2)
          return;
        
        if (!parts[1])
          return;
             
        urls.add(parts[1]);
      });
      
      var items = [];
      urls.forEach(function (item) { items.push(item) } );
      
      let self = this;    
      let callback = function(reports) { 
        window.setTimeout(function () { self.onDomainReportsLoaded(urls, reports) }, 0);
      };            
      
      this.getReportApi().loadReports(items, callback);  
    },
    
    onDomainReportsLoaded : function (domains, reports) {
    
      if (reports) {
        
        let self = this;
        
        reports.forEach( function(item) {
            
          self.getLogger().logDebug("Domain Report loaded : "+item);
          // In case the item is pending bail out, so that we reload the status.
          if (item.isPending)
            return;
        
          // Same applies if the count is for some reason invalid.
          if (item["positives"] == null || item["positives"] < 0)
            return;  
          
          // Now we are sure the status recorded in our database is valid and ready to display.
          // So let's remove the url from the todo list.
          domains.delete(item.resource);
          
          // Urls with zero positives are on our white list. We can skip those..
          if (item["positives"] === 0)
            return;
        
          self.getMessageApi().showUrlMessage(item["resource"], item["permalink"], item["positives"], item["total"]);    
        });
      }
      
      if (domains.size == 0)
        return; 
    
      this.getLogger().logDebug("Requesting Domain Report for " + domains);
      
      let self = this;
      let callback = function(domain, response) {
        self.getLogger().logDebug(response.status);
        self.getLogger().logDebug(response.responseText);
      };    
      
      this.getDomainApi().getDomainReport(domains.values().next().value, callback );
    },      
    
    /**
     *  Returns a reference to the global header data object.
     *
     *  @return{CurrentHeaderData} the headerDataObject
     */
    getHeaderData : function() {
      return currentHeaderData;
    },
    
    getDomainApi : function() {
      if (!net.tschmid.secondopinion.domain)
        throw "Failed to import logger";  
    
      return net.tschmid.secondopinion.domain;
    },
    
    getReportApi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.reports)
        throw "ui.url.js failed to import reports";   
    
      return net.tschmid.secondopinion.reports;
    },
    
    getMessageApi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.messages)
        throw "Failed to import messages";
    
      return net.tschmid.secondopinion.ui.messages;
    },    
          
    getLogger : function() {
      if (!net.tschmid.secondopinion.logger)
        throw "Failed to import logger";  
    
      return net.tschmid.secondopinion.logger;
    }   
  }
  
  net.tschmid.secondopinion.ui.file = new SecondOpinionEmailUi(); 
  
}());
