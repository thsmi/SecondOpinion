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

if (!net.tschmid.secondopinion.ui)
  net.tschmid.secondopinion.ui = {};

(function() {

  /* global Components */
  /* global gMessageDisplay */
  /* global document */
  /* global URL */
  
  var Cu = Components.utils;
  var Ci = Components.interfaces;
  var Cc = Components.classes;
  
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

    unload : function() {
      var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
      observerService.removeObserver(this, "MsgMsgDisplayed", false);    
    },

    observe : function (subject, topic, data) { 
   
      if (topic != "MsgMsgDisplayed" )
        return;
      
      var self = this;
      // observers are global objects, we do not want to block it...
      window.setTimeout(function () { self.onMessageParsed(data); }, 50);
    },
  
    onMessageParsed : function(uri) {
      
      var message = gMessageDisplay.displayedMessage;
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
      var flags = FLAGS.SentMail | FLAGS.Drafts | FLAGS.Templates | FLAGS.Queue;
      
      if (folder.isSpecialFolder(flags, true))
        return;
      
      var urls = new Set();
      
      // Extract the link nodes in the message and analyse them, looking for suspicious URLs... 
      var linkNodes = document.getElementById('messagepane').contentDocument.links;
      for (var index = 0; index < linkNodes.length; index++)
        this.sanitizeUrl(linkNodes[index].href, urls);
      
      // Extract the action urls associated with any form elements in the message and analyse them.
      var formNodes = document.getElementById('messagepane').contentDocument.querySelectorAll("form[action]");
      for (index = 0; index < formNodes.length; index++)
        this.sanitizeUrl(formNodes[index].action, urls);
            
      // Convert the set into an array...
      var items = [];
      urls.forEach(function (item) { items.push(item); } );
      
      var self = this;    
      var callback = function(reports) { 
        window.setTimeout(function () { self.onUrlReportsLoaded(urls, reports); }, 0);
      };    
      
      this.getCache().loadReports(items, callback);       
    },        
  
    onUrlReportsLoaded : function (urls, reports) {
   
      var self = this;  
      
      // filter out all existing reports
      if (reports) {
        
        reports.forEach( function(item) {
            
          self.getLogger().logDebug("URL Report loaded : "+item.toSource());
          // In case the item is pending bail out, so that we reload the status.
          if (item.isPending())
            return;
        
          // Same applies if the count is for some reason invalid.
          if (item.getPositives() < 0)
            return;
          
          // Now we are sure the status recorded in our database is valid and ready to display.
          // So let's remove the url from the todo list.
          urls.delete(item.getResource());          
          
          // Urls with zero positives are on our white list. We can skip those..
          if (item.getPositives() === 0)
            return;
        
          self.getMessageApi().showUrlMessage(item);    
        });
      }
    
      if (urls.size === 0)
        return; 
       
      var callback = function(url, response) {
        window.setTimeout(function () { self.onUrlReportReceived(url, response); } , 0);
      };
      
      urls = Array.from(urls.keys());
         
      this.getUrlEngines().forEach( function(engine) {
        engine.getUrlReport( urls, callback );
      });
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
		
      var self = this;  
      var callback = function(url, response) {
        
        if (response.getError()) {          
          self.getMessageApi().showError(response.getError().getMessage());
          return;
        }
        
        var reports = response.getReports();
      
        reports.forEach( function(item) {

          if (!item.getLink())
            return;
          
          self.getMessageApi().openReport(item.getLink());           
        });
        
      };
        
      this.getUrlEngines().forEach( function(engine) {
        engine.getUrlReport( self.sanitizeUrl(href), callback );
      });      
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
        var url = new URL(href);
  
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
        
      if (response.getError()) {          
        this.getMessageApi().showError(response.getError().getMessage());
        return;
      }

      var reports = response.getReports();

      var that = this;
      
      reports.forEach(function (report) {
        
        if (report.hasError()){
          that.getLogger().logDebug("Skipping report has errors");
          return;
        }
        
        if (!report.hasReport()) {
          that.getLogger().logDebug("Unknown url");
        
          if (!that.getSettings().isUnknownHashSafe())
            this.getMessageApi().showUnknownUrlMessage("Url");
        
          return;
        }        
                
        if (report.isPending()) {
          that.getMessageApi().showUrlMessage(report);
          return;        
        }
        
        // Update the database, it may clear any attachments marked as pending...
        that.getCache().storeReport( report, true );

        // we need to intervene only if the attachment is dangerous, which means positives larger than zero         
        if (report.getPositives() <= 0)
          return;
          
        // Obviously a file is not safe, we need to show a message...
        that.getMessageApi().showUrlMessage(report);
    
        return;          
      });       
      
    },   
 
    
    // Shotcuts to api calls... 
    getUrlEngines : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.engine)
        throw "ui.url.js could not load URL API";
      
      if (!Array.isArray(net.tschmid.secondopinion.engine))
        throw "ui.url.js no url engines registered";
      
      var engines = [];
     
      net.tschmid.secondopinion.engine.forEach( function(engine) {
        
        if (!Array.isArray(engine))
          return;
          
        if (!engine[1])
          return;
          
        if (!engine[1].api)
          return;
          
        engines.push(engine[1].api);
      });
      
      if (!engines.length)
        throw "ui.url.js no url engines registered";
      
      return engines;
    },
    
    getCache : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.Cache)
        throw "ui.url.js failed to import cache";   
    
      return net.tschmid.secondopinion.Cache;
    },
    
    getMessageApi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.messages)
        throw "Failed to import messages";
    
      return net.tschmid.secondopinion.ui.messages;
    },
       
    getLogger : function() {
      if (!net.tschmid.secondopinion.Logger)
        throw "Failed to import logger";  
    
      return net.tschmid.secondopinion.Logger;
    },

	  getSettings : function () {
	    if (!net.tschmid.secondopinion.settings)
  	    throw "Failed to import settings";
	    return net.tschmid.secondopinion.settings;
	  }  
  };
  
  net.tschmid.secondopinion.ui.url = new SecondOpinionUrlUi();
  
}());
