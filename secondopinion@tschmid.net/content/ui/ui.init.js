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
  
  function SecondOpinionInitUi() {}

  SecondOpinionInitUi.prototype = {     

    load : function() {
      var self = this;
      
      var listener = {
        onStartHeaders : function() { self.onStartHeaders(); },
        onEndHeaders : function() { },
        onEndAttachments : function() { }
      };
    
      gMessageListeners.push(listener);
      
      this.getFileApi().load();
      this.getUrlApi().load(); 
      this.getContextUi().load();      
      
      var SETTINGS = net.tschmid.secondopinion.SETTINGS;
      var links = net.tschmid.secondopinion.ui.links;
      if (SETTINGS.isAwareOfTermsOfService())
        return;
        
      links.openUrlInTab("https://www.virustotal.com/en/about/terms-of-service/");
      SETTINGS.setAwareOfTermsOfService(); 
      
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
    	try {
        // Headers are only loaded when the message changes...        
        // ... so drop any pending request...
    	  net.tschmid.secondopinion.SESSION.reset();  
	      this.getMessageApi().hideMessages();
    	} catch (ex) {
    		this.getLogger().logError(ex);
    	}
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
        
    getContextUi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.contextmenu)
        throw "Failed to import context menu ui";
     
      return net.tschmid.secondopinion.ui.contextmenu;   
    },
    
    getLogger : function() {
      if (!net.tschmid.secondopinion.LOGGER)
        throw "Failed to import logger";  
    
      return net.tschmid.secondopinion.LOGGER;
    }   
  };
  
  net.tschmid.secondopinion.ui.init = new SecondOpinionInitUi(); 
  
}());
