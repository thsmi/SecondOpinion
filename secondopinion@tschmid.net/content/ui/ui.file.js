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
 
  /* global gMessageListeners */
  /* global currentAttachments */
  
  if (!net.tschmid.secondopinion.SETTINGS)
    throw "Failed to import SETTINGS";
  
  var SETTINGS = net.tschmid.secondopinion.SETTINGS;  
 
  
  function SecondOpinionFileUi() {}

  SecondOpinionFileUi.prototype = {     

    load : function() {
      var self = this;
      
      var listener = {
        onStartHeaders : function() { },
        onEndHeaders : function() { },
        onEndAttachments : function() { self.onEndAttachments(); }
      };
    
      gMessageListeners.push(listener);
    },

    unload : function() { },
    
    // Implement the Message Listener interfaces. It notifies 
    // us every time a new Message is loaded and when all attachments
    // are loaded. 
    onEndAttachments: function() {
   
      var self = this;
      var callback = function(url, name,checksum) {
        self.onCheckSumCalculated(url, name,checksum);
      };
            
      for( var index in currentAttachments ) {   
          
        self.getAttachmentApi().getAttachmentCheckSum(
          currentAttachments[index].url,
          currentAttachments[index].name,       
          callback);
      }
    },
  
    onCheckSumCalculated: function(uri, name, checksum) {
        
      this.getLogger().logDebug("Checksum "+ checksum +" calculated for "+ name);
      
      var self = this;  
      
      this.getFileEngines().forEach( function(engine) {
        self.getMessageApi().addLoading( engine.getEngine(), checksum, name );
      });     
      
      var callback = function(reports) { 
        window.setTimeout(function () { self.onReportLoaded(uri, name, checksum, reports); }, 0);
      };    
    
      this.getCache().loadReports(checksum, callback);
    },
    
    onReportLoaded : function (uri, filename, checksum, reports) {

      var LOGGER = this.getLogger(); 
      var MESSAGES = this.getMessageApi();
    	
      var self = this;
      
      this.getFileEngines().forEach( function(engine, idx) {
        
        var report = null;
        
        // Check if we could load a non pending report for this engine...
        reports.forEach( function(item) {
          
          if (item.getEngine() !== (idx+1)) {
            LOGGER.logDebug("Report Engine "+item.getEngine()+" and engine "+ idx);
            return;
          }
            
          if (item.isPending()) {
            LOGGER.logDebug("Report isPending "+item.isPending);
            MESSAGES.addPending(item);
            return;
          }
            
          report = item;
        });
        
        // ... in case we found one we take a shortcut
        if (report !== null) {
          
          LOGGER.logDebug("Report for "+filename+" and engine "+idx+" loaded");
          
          report.setFilename(filename);
        
          MESSAGES.addSuspicious(report);
          self.blockAttachment(uri, report);
          return;       
        }
        
        self.getLogger().logDebug("Report for "+filename+" and engine "+idx+" could not be loaded, requesting from server");
        
        // ... otherwise we need to request a report from the server.
        var callback = function(filename, checksum, response) {
          window.setTimeout(function () { self.onFileReportReceived(uri, filename, checksum, response, engine); }, 0);
        };
    
        engine.getFileReport( filename,checksum, callback );      
      });
    },
 
    onFileReportReceived: function (uri, filename, checksum, response, engine) {
    
    	var LOGGER = this.getLogger(); 
    	var MESSAGES = this.getMessageApi();
    	
      if (response.getError()) {          
        MESSAGES.showError(response.getError().getMessage());
        return;
      }
      
      var reports = response.getReports();
      
      if (reports.length !== 1) {
        LOGGER.logDebug("Expected one report file but got "+ reports.length);
        return;
      }
      
      LOGGER.logDebug(reports);
      
      var report = reports[0];

      // We need to reset the name, because it may have been obfuscated
      report.setFilename(filename);     
      
      if (report.hasError()) {
        LOGGER.logDebug("Skipping report for "+filename+" is invalid.");
      	MESSAGES.addError(report.getEngine(), checksum, filename);
        return;
      }
      
      if (!report.hasReport()) {
        LOGGER.logDebug("Unknown hash "+filename+" is valid");        
        MESSAGES.addUnknown(report, checksum);
          
        return;
      }
      
      // Still pending in queue, so we take a short cut...
      // ... and indicate we don't know this file but it's suspicious.     
      if (report.isPending()) {
      	MESSAGES.addPending(report);
        this.blockAttachment(uri, report);
        return; 
      }
      
      
      LOGGER.logDebug("Storing report for "+report.getFilename()+" with "+report.getPositives()+" positives" );
      this.getCache().storeReport( report );
      
      // we need to intervene only if the attachment is dangerous, which means positives larger than zero         
      if (report.getPositives() <= 0) {
      	MESSAGES.addClean(report);
        return; 
      }
      
      MESSAGES.addSuspicious(report);
      this.blockAttachment(uri, report);
    },  
     
    blockAttachment : function(uri, report) {
      
      this.getLogger().logDebug(" Blocking dangrous file "+report.getFilename() );
            
      // Obviously a file is not save, we need to show a message...
      this.getAttachmentApi().blockAttachment(uri);

      this.getLogger().logDebug(report.getLink()); 
    },
    
    openReportByAttachment : function(items) {  
        
      if (!Array.isArray(items)) 
        return;
  
      if (items.length === 0)
        return;
  
      var self = this;
      function callback(url, name, hash) {        
        if (!hash)
          return;
      
        self.openReportByHash(hash);
      }    
         
      items.forEach(function(item) {
        self.getAttachmentApi().getAttachmentCheckSum(item.url, item.name, callback );   
      } );
    },
    
    openReportByHash : function (hash) {
      this.getMessageApi().openReport("https://www.virustotal.com/en/file/"+hash+"/analysis/");
      this.getMessageApi().openReport("https://www.metascan-online.com/#!/results/file/"+hash+"/regular");
      },
    
    // Shotcuts to api calls... 
    getAttachmentApi : function() {
       if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.attachments)
        throw "Failed to import attachments api";       
    
      return net.tschmid.secondopinion.attachments;
    },
    
    getCache : function() {
       if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.CACHE)
        throw "Failed to import cache";
    
      return net.tschmid.secondopinion.CACHE;
    },
    
    getFileEngines : function() {
      
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.engine)
        throw "ui.file.js could not load URL API";
      
      if (!Array.isArray(net.tschmid.secondopinion.engine))
        throw "ui.file.js no url engines registered";
      
      var engines = [];
     
      net.tschmid.secondopinion.engine.forEach( function(engine) {
        
        if (!Array.isArray(engine))
          return;
          
        if (!engine[2])
          return;
          
        if (!engine[2].API)
          return;
          
        engines.push(engine[2].API);
      });
      
      if (!engines.length)
        throw "ui.file.js no file engines registered";
      
      return engines;
    }, 
    
    getMessageApi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.messages)
        throw "Failed to import messages";
    
      return net.tschmid.secondopinion.ui.messages;
    },  
    
    getLogger : function() {
      if (!net.tschmid.secondopinion.LOGGER)
        throw "Failed to import logger";  
    
      return net.tschmid.secondopinion.LOGGER;
    }   
  };
  
  net.tschmid.secondopinion.ui.file = new SecondOpinionFileUi(); 
  
}());
