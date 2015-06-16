"use strict";

if (!Cu)
  var Cu = Components.utils;
if (!Ci)
  var Ci = Components.interfaces;
if (!Cc)
  var Cc = Components.classes;

var net = net || {};

if (!net.tschmid)
  net.tschmid = {};

if (!net.tschmid.secondopinion)
  net.tschmid.secondopinion = {};

if (!net.tschmid.secondopinion.ui)
  net.tschmid.secondopinion.ui = {};

(function() {
  function SecondOpinionUrlUi() {}

  SecondOpinionUrlUi.prototype = {

    load : function () {
        
      var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
      observerService.addObserver(this, "MsgMsgDisplayed", false);
      
    // Make sure the observer gets unloaded, it's a global object which leads to terrible leaks.
/*  window.addEventListener("unload", function handler() {
        window.removeEventListener("unload", handler, true);
        self.onUnload();
    }, true);*/       
    },

    unload() {
      var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
      observerService.removeObserver(this, "MsgMsgDisplayed", false);    
    },

    observe : function (subject, topic, data) { 
   
      if (topic != "MsgMsgDisplayed" )
        return;
      
      var self = this;
      // observers are global objects, we do not want to block it...
      window.setTimeout(function () { self.onMessageParsed(data) }, 50);
    },
  
    onMessageParsed(uri) {
      
      let message = gMessageDisplay.displayedMessage;
      if (!message)
        return;
      
      // This observer a global object. Which means we receive messages from other windows as well as our own.
      if (message.folder.getUriForMsg(message) != uri)
        return; 
      
      if (!uri)
        return;
      
      var folder = message.folder;
      
      // Ignore nntp and RSS messages.
      if (folder.server.type == 'nntp' || folder.server.type == 'rss')
        return;  
      
      // Also ignore messages in Sent/Drafts/Templates/Outbox.
      const FLAGS = Ci.nsMsgFolderFlags;
      let flags = FLAGS.SentMail | FLAGS.Drafts | FLAGS.Templates | FLAGS.Queue;
      
      if (folder.isSpecialFolder(flags, true))
        return;
      
      let urls = new Set();
      
      // Extract the link nodes in the message and analyse them, looking for suspicious URLs... 
      let linkNodes = document.getElementById('messagepane').contentDocument.links;
      for (var index = 0; index < linkNodes.length; index++)
        this.sanitizeUrl(linkNodes[index].href, urls);
      
      // Extract the action urls associated with any form elements in the message and analyse them.
      let formNodes = document.getElementById('messagepane').contentDocument.querySelectorAll("form[action]");
      for (index = 0; index < formNodes.length; index++)
        this.sanitizeUrl(formNodes[index].action, urls);
            
      // Convert the set into an array...
      var items = [];
      urls.forEach(function (item) { items.push(item) } );
      
      let self = this;    
      let callback = function(reports) { 
        window.setTimeout(function () { self.onUrlReportsLoaded(urls, reports) }, 0);
      };    
      
      this.getReportApi().loadReports(items, callback);       
    },        
  
    onUrlReportsLoaded : function (urls, reports) {
    
      if (reports) {
        
        let self = this;
        
        reports.forEach( function(item) {
            
          self.getLogger().logDebug("URL Report loaded : "+item.toSource());
          // In case the item is pending bail out, so that we reload the status.
          if (item.isPending)
            return;
        
          // Same applies if the count is for some reason invalid.
          if (item["positives"] == null || item["positives"] < 0)
            return;  
          
          // Now we are sure the status recorded in our database is valid and ready to display.
          // So let's remove the url from the todo list.
          urls.delete(item.resource);
          
          // Urls with zero positives are on our white list. We can skip those..
          if (item["positives"] === 0)
            return;
        
          self.getMessageApi().showUrlMessage(item["resource"], item["permalink"], item["positives"], item["total"]);    
        });
      }
    
      if (urls.size == 0)
        return; 
    
      // some magic. We can send a batch request with upto four urls... 
      var batch = [];
   
      let self = this;  
      let callback = function(url, response) {
        self.onUrlReportReceived(url, response);
      } 
    
      urls.forEach( function (item) {        
    
        batch.push(item);
      
        if (batch.length < 4) 
          return;
      
        self.getUrlApi().getUrlReport(batch, callback );
        batch = [];   
      } ) 
        
      this.getUrlApi().getUrlReport(batch, callback );
    },  
  
    /**
	   * Opens the report for the given url in the default webbrowser.
	   *
	   * In case of an error the method will fail silently.
	   * 
	   *  @param {String}
	   *     the url which should be checked.
	   */
    openReportByUrl : function(href) {
		
	    // Opening an url is a bit more complicated than opening an attachment.
	    // With files we would calculate the hash sum, but we can't do this here
	    // which means we have to send a request to VirusTotal, wait for the response
	    // and open it in the browser.
	  
	    // This means we need to reimplement the whole check process. But in this 
	    // case we take a short cut, and skip the database part.
		
      let self = this;  
      let callback = function(url, response) {
		    var report = self.getResponseApi().parseResponse(response);
		
        if (!report)
          return;
	  
	      if (!report["permalink"])
		      return;
	    		
		    self.getMessageApi().openReport(report["permalink"]);
      } 
        
      this.getUrlApi().getUrlReport( this.sanitizeUrl(href), callback );		
	},
  
    /**
     *  Sanitizes a given url. Which means it removes all authentication 
	 *  related information as well as the pathname, the search and the hash part
	 * 
	 *  Only http and https urls will processed, all other urls will be handled as invalid.
	 *
	 *  @param {String}
	 *     the url which should be sanitized.
	 *  @optional @param {Set}
	 *     an optional set to which the sanitized url should be added.
	 * 
	 *  @return {String|undefined}
	 *    the sanitized url or undefined in case the url is invalid and can not be parsed.
	 *    
	 **/
    sanitizeUrl : function(href, urls) {
         
      if (!href)
        return;
  
      try {
        let url = new URL(href);
  
        if (url.protocol !== "http:" && url.protocol !== "https:")
          return;

        // we drop the credentials, the search as well as the hash, as they may transport confidential information
		if (urls)
		  urls.add(url.origin/* +"/"+ url.pathname*/);
	  
	    return url.origin;
      }
      catch (e) {
        // We might fail here in case the url is invalid...
      }
	  
      return;
    },
  
    onUrlReportReceived: function (url, response) {
  
  
      var json = this.getResponseApi().parseResponse(response);
    
      if (!json)
        return;
    
      this.parseUrlReport(json);  
    },   
  
    parseUrlReport : function(report) {
        
      // in case reports is an array, we unwrap it silently.
      if (Array.isArray(report)) {
      
        let self = this;
        report.forEach(function (item) {
          self.parseUrlReport(item);
        } );
        
        return;
      }           
	  
      // A response code of -2 means still pending in queue so we take a short cut...
      // ... and indicate we don't know this file but it's suspicious.
      if (report["response_code"] == -2) {
        this.getMessageApi().showUrlMessage(report["url"], report["permalink"] );
        return;
      }
    
      // A response code of 1  indicates everything went fine. Anything else is a fatal error...  
      if (report["response_code"] != 1)
        return;
    
      // Some engines have a really bad quality and return many false positives.
      // We need to exclude those.      
      let excluded = this.getSettings().getExcluded();      
      
      let self = this;
      excluded.forEach(function(item) {
        
        if ( !item )
          return;
                
        if ( !report["scans"] || !report["scans"][item.trim()] ) 
          return;
        
        self.getLogger().logDebug("Excluding results from "+item);
        
        if (report["scans"][item.trim()]["detected"])
          report["positives"] -= 1;
        
        report["total"] -= 1;
      } );      
    
      // Update the database, it may clear any attachments marked as pending...
      this.getReportApi().storeReport((new URL(report["url"])).origin, false, report["permalink"], report["positives"], report["total"], true);   
      
      // we need to intervene only if the attachment is dangerous, which means positives larger than zero         
      if (report["positives"] <= 0)
        return;
      
      // Obviously a file is not safe, we need to show a message...
      this.getMessageApi().showUrlMessage(report["url"], report["permalink"], report["positives"], report["total"]);
    
      return;       
    },
    
    // Shotcuts to api calls... 
    getUrlApi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.url)
        throw "ui.url.js could not load URL API";      
    
      return net.tschmid.secondopinion.url;
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
    
    getResponseApi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.response)
        throw "ui.url.js Failed to import response";
    
      return net.tschmid.secondopinion.ui.response;
    },   
    
    getLogger : function() {
      if (!net.tschmid.secondopinion.logger)
        throw "Failed to import logger";  
    
      return net.tschmid.secondopinion.logger;
    },

	  getSettings : function () {
	    if (!net.tschmid.secondopinion.settings)
  	    throw "Failed to import settings";
	
	    return net.tschmid.secondopinion.settings;
	  },    
  }
  
  net.tschmid.secondopinion.ui.url = new SecondOpinionUrlUi();          
}());
