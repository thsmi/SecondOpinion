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
  
  /* global document */
  
  function SecondOpinionMessagesUi() {}

  SecondOpinionMessagesUi.prototype = {
      
	hideMessages : function() {
    this.clearMessages();
	  this.hideWarnings();
	  this.hideErrors();
	  
	  document.getElementById("secondOpinionBar").hidden = true;
    //document.getElementById("secondOpinionDetail").hidden = true;
    
    document.getElementById("secondOpinionUnknownHeader").hidden = true;
    document.getElementById("secondOpinionDangerousHeader").hidden = true;
    
	},
	  
    hideWarnings : function() {
      document.getElementById("secondOpinionWarningBar").hidden = true;
      document.getElementById("secondOpinionWarningBarDeck").selectedIndex = "1";
    },
	
    hideErrors : function() {
      document.getElementById("secondOpinionErrorBar").hidden = true;
    },		  
	  
    showError: function(message) {
      document.getElementById("secondOpinionBar").hidden = false;     
      document.getElementById("secondOpinionErrorBar").hidden = false;
      document.getElementById("secondOpinionError").value = message;
    },  
  
    showWarning : function(parent, name, permalink, positives, total) {
      
      var item = document.createElement("label");
      
      if ((typeof positives !== 'undefined') || (positives === -1))
        item.setAttribute("value",""+name+" ("+positives+"/"+total+")");
      else      
        item.setAttribute("value",""+name+" ( scan pending...)");
        
      var self = this;
	  
      item.setAttribute("class", "text-link");
      item.addEventListener("click", function() { self.openReport(permalink); }, false);
      
      parent.appendChild(item);

      document.getElementById("secondOpinionWarningBar").hidden = false;
      document.getElementById("secondOpinionBar").hidden = false;
      document.getElementById("secondOpinionWarningBarDeck").selectedIndex = "0";
      
      document.getElementById("secondOpinionDangerousHeader").hidden = false;
    },
  
    showUrlMessage : function(report) {
        
      var parent = document.getElementById("secondOpinionDetailUrlItems");
      this.showWarning(parent, report.getUrl(), report.getLink(), report.getPositives(), report.getTotal());
    },
    
    showUnknownUrlMessage : function(url) {
      var parent = document.getElementById("secondOpinionDetailUrlItems");
      alert(url);
    },
    
    showFileMessage: function(report) {      
      var parent = document.getElementById("secondOpinionDetailFileItems");
      this.showWarning(parent, report.getFilename()+" "+report.getEngine(), report.getLink(), report.getPositives(), report.getTotal());
    },  
    
    showUnknownFileMessage : function(filename) {      
      var parent = document.getElementById("secondOpinionDetailUnknownFileItems");
      
      var item = document.createElement("label");
      item.setAttribute("value",""+filename+" ( unknow )");
      //item.setAttribute("class", "text-link");
      parent.appendChild(item);
      
      document.getElementById("secondOpinionWarningBar").hidden = false;
      document.getElementById("secondOpinionBar").hidden = false;
      
      document.getElementById("secondOpinionUnknownHeader").hidden = false;      
    },
       
    clearFileMessages : function() {
      var elm = document.getElementById("secondOpinionDetailFileItems");
      while (elm.hasChildNodes())
        elm.removeChild(elm.firstChild);      
      
      elm = document.getElementById("secondOpinionDetailUnknownFileItems");
      while (elm.hasChildNodes())
        elm.removeChild(elm.firstChild);        
    },
    
    clearUrlMessages : function() {
      var elm = document.getElementById("secondOpinionDetailUrlItems");
      while (elm.hasChildNodes())
        elm.removeChild(elm.firstChild);
        
      elm = document.getElementById("secondOpinionDetailUnknownUrlItems");
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
    }
  };
  
  net.tschmid.secondopinion.ui.messages = new SecondOpinionMessagesUi(); 
  
}()); 