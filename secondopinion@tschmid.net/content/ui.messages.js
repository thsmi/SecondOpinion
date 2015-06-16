"use strict";

var net = net || {};

if (!net.tschmid)
  net.tschmid = {};

if (!net.tschmid.secondopinion)
  net.tschmid.secondopinion = {};

if (!net.tschmid.secondopinion.ui)
  net.tschmid.secondopinion.ui = {};

(function() {
  function SecondOpinionMessagesUi() {}

  SecondOpinionMessagesUi.prototype = {
      
	hideMessages : function() {
      this.clearMessages();
	  this.hideWarnings();
	  this.hideErrors();
	  
	  document.getElementById("secondOpinionBar").hidden = true; 
	},
	  
    hideWarnings : function() {
      document.getElementById("secondOpinionWarningBar").hidden = true;
    },
	
    hideErrors : function() {
      document.getElementById("secondOpinionErrorBar").hidden = true;
    },		  
	  
    showError: function(message) {
      document.getElementById("secondOpinionBar").hidden = false;     
      document.getElementById("secondOpinionErrorBar").hidden = false;
      document.getElementById("secondOpinionError").value = message;
    },  
  
    showWarning : function(parent, name, permalink ,positives, total) {
      
      let item = document.createElement("label");
      
      if (typeof positives !== 'undefined')
        item.setAttribute("value",""+name+" ("+positives+"/"+total+")");
      else      
        item.setAttribute("value",""+name+" ( scan pending...)");
        
	  var self = this;
	  
      item.setAttribute("class", "text-link");
      item.addEventListener("click", function() { self.openReport(permalink); }, false);
      
      parent.appendChild(item);

      document.getElementById("secondOpinionWarningBar").hidden = false;
      document.getElementById("secondOpinionBar").hidden = false;       
    },
  
    showUrlMessage : function(url, permalink, positives, total) {
        
      var parent = document.getElementById("secondOpinionDetailUrlItems");
      this.showWarning(parent, url, permalink, positives, total);
    },
    
    showFileMessage: function(uri, name, permalink, positives, total) {
      
      var parent = document.getElementById("secondOpinionDetailFileItems");
      this.showWarning(parent, name, permalink, positives, total);
    },  
    
    clearFileMessages : function() {
      var elm = document.getElementById("secondOpinionDetailFileItems");
      while (elm.hasChildNodes())
        elm.removeChild(elm.firstChild);        
    },
    
    clearUrlMessages : function() {
      var elm = document.getElementById("secondOpinionDetailUrlItems");
      while (elm.hasChildNodes())
        elm.removeChild(elm.firstChild);
    },
    
    clearMessages : function() {
      this.clearFileMessages();
      this.clearUrlMessages();
    },
    
	
	openReport : function(permalink) {
	  this.getLinkApi().openUrl(permalink);
	},

    getLinkApi : function() {
      if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.links)
        throw "Failed to import link";
  
      return net.tschmid.secondopinion.ui.links;
    }, 
  }
  
  net.tschmid.secondopinion.ui.messages = new SecondOpinionMessagesUi(); 
  
}()); 