"use strict";

var net = net || {};

if (!net.tschmid)
  net.tschmid = {};

if (!net.tschmid.secondopinion)
  net.tschmid.secondopinion = {};

if (!net.tschmid.secondopinion.ui)
  net.tschmid.secondopinion.ui = {};

(function() {
  function SecondOpinionFileUi() {}

  SecondOpinionFileUi.prototype = {     

    load : function() {
      let self = this;
      
      let listener = {
        onStartHeaders : function() { },
        onEndHeaders : function() { },
        onEndAttachments : function() { self.onEndAttachments(); },
      };
    
      gMessageListeners.push(listener);
    },

    unload : function() { },
    
    // Implement the Message Listener interfaces. It notifies 
    // us every time a new Message is loaded and when all attachments
    // are loaded. 
    onEndAttachments: function() {
   
      let self = this;
      for( let index in currentAttachments ) {   
    
        let callback = function(url, name,checksum) {
          self.onCheckSumCalculated(url, name,checksum);
        };
      
        self.getAttachmentApi().getAttachmentCheckSum(
          currentAttachments[index].url,
          currentAttachments[index].name,       
          callback);
      }
    },
  
    onCheckSumCalculated: function(uri, name, checksum) {
        
      this.getLogger().logDebug("Checksum "+ checksum +" calculated for "+ name);
    
      let self = this;    
      let callback = function(reports) { 
        self.onReportLoaded(uri, name, checksum, reports);
      };    
    
      this.getReportApi().loadReports(checksum, callback);
    },
    
    onReportLoaded : function (uri, name, checksum, reports) {
    
      // Check if loading the report succeeded.
      if( reports.length && !reports[0].pending) {
    
        // take a short cut in case we have a cached report which rated ...
        // ... this attachment as dangerous
        this.showMessage(uri, name, reports[0]["permalink"], reports[0]["positives"], reports[0]["total"] );
        return;   
      } 
      
      let self = this;
      let callback = function(name, checksum, response) {
        self.onFileReportReceived(uri, name, checksum, response);
      }
    
      this.getFileApi().getFileReport(name,checksum, callback);    
    },
 
    onFileReportReceived: function (uri, name, checksum, response) {
    
      var report = this.getResponseApi().parseResponse(response);
    
      if (!report)
        return;
  
      this.parseFileReport(uri, name, checksum, report);
    },  
  
    showMessage : function(uri, name, permalink, positives, total) {
      this.getAttachmentApi().blockAttachment(uri);
      this.getMessageApi().showFileMessage(uri, name, permalink, positives, total);
    },     
  
    parseFileReport : function (uri, name, checksum, report) {
        
      // A response code of -2 means still pending in queue so we take a short cut...
      // ... and indicate we don't know this file but it's suspicious.
      if (report["response_code"] == -2) {
        this.showMessage(uri, name, report["permalink"] );
        return;
      }

      // A response code of 1  indicates everything went fine. Anything else is a fatal error...    
      if (report["response_code"] != 1)
        return;

      // Update the database, it may clear any attachments marked as pending...
      this.getReportApi().storeReport(checksum, false, report["permalink"], report["positives"], report["total"]);  
    
      // we need to intervene only if the attachment is dangerous, which means positives larger than zero           
      if (report["positives"] <= 0)
        return;
    
      // Obviously a file is not save, we need to show a message...
      this.showMessage(uri, name, report["permalink"], report["positives"], report["total"]);     

      return;         
    },
    
    openReportByAttachment : function(items) {  
        
      if (!Array.isArray(items)) 
        return;
  
      if (items.length == 0)
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
    },
    
    
    // Shotcuts to api calls... 
    getAttachmentApi : function() {
       if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.attachments)
        throw "Failed to import attachments api";       
    
      return net.tschmid.secondopinion.attachments;
    },
    
    getReportApi : function() {
       if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.reports)
        throw "Failed to import reports";
    
      return net.tschmid.secondopinion.reports;
    },
    
    getFileApi : function() {
       if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.files)
        throw "ui.files.js Failed to import reports";
    
      return net.tschmid.secondopinion.files;
    },  
    
    getMessageApi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.messages)
        throw "Failed to import messages";
    
      return net.tschmid.secondopinion.ui.messages;
    },  
        
    getResponseApi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.response)
        throw "Failed to import response";
    
      return net.tschmid.secondopinion.ui.response;
    },
    
    getLogger : function() {
      if (!net.tschmid.secondopinion.logger)
        throw "Failed to import logger";  
    
      return net.tschmid.secondopinion.logger;
    }   
  }
  
  net.tschmid.secondopinion.ui.file = new SecondOpinionFileUi(); 
  
}());
