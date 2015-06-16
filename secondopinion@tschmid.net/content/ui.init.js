"use strict";

var net = net || {};

if (!net.tschmid)
  net.tschmid = {};

if (!net.tschmid.secondopinion)
  net.tschmid.secondopinion = {};

if (!net.tschmid.secondopinion.ui)
  net.tschmid.secondopinion.ui = {};

(function() {
  function SecondOpinionInitUi() {}

  SecondOpinionInitUi.prototype = {     

    load : function() {
      let self = this;
      
      let listener = {
        onStartHeaders : function() { self.onStartHeaders(); },
        onEndHeaders : function() { },
        onEndAttachments : function() { },
      };
    
      gMessageListeners.push(listener);
      
      this.getFileApi().load();
      this.getUrlApi().load(); 
      this.getContextUi().load();      
      
    },

    unload : function() { 
      this.getFileApi().unload();
      this.getUrlApi().unload();
      this.getContextUi().unload();
    },
    
    // Implement the Message Listener interfaces. It notifies 
    // us every time a new Message is loaded and when all attachments
    // are loaded.
    onStartHeaders: function() {      
      // Headers are only loaded when the message changes...        
      // ... so drop any pending request...
      this.getRequestApi().reset();    
	    this.getMessageApi().hideMessages();        
    },
      
    getUrlApi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.url)
        throw "ui.init.js Failed to import url";
  
      return net.tschmid.secondopinion.ui.url;
    },     
    
    getFileApi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.file)
        throw "Overlay.js Failed to import file";
  
      return net.tschmid.secondopinion.ui.file;
    },  
    
    getMessageApi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.messages)
        throw "ui.init.js Failed to import messages";
    
      return net.tschmid.secondopinion.ui.messages;
    },  
    
    getRequestApi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.requests )
        throw "Failed to import requests";
  
      return net.tschmid.secondopinion.requests;        
    }, 
    
    getContextUi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.contextmenu)
        throw "Failed to import context menu ui";
     
      return net.tschmid.secondopinion.ui.contextmenu;   
    },
    
    getLogger : function() {
      if (!net.tschmid.secondopinion.logger)
        throw "Failed to import logger";  
    
      return net.tschmid.secondopinion.logger;
    }   
  }
  
  net.tschmid.secondopinion.ui.init = new SecondOpinionInitUi(); 
  
}());
