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
  	
    state : 0,
      
  	hideMessages : function() {
  	
      this.clearMessages();
	    
	    this.hideWarnings();
	    this.hideErrors();

	    document.getElementById("secondOpinionBar").hidden = true;
      //document.getElementById("secondOpinionDetail").hidden = true;
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
      
    },
    
    _getEngine : function( engine ) {
    	
    	if (engine.getEngine)
    	  engine = engine.getEngine();
    	
      if (engine === 1)
        return "VirusTotal";
        
      if (engine === 2)
        return "Metascan";
        
      throw new Error("Unknown engine..."+engine);
    },
    
    _generateId : function( engine, resource) {
    	return window.btoa(""+engine+":"+resource);
    },
    
    _addItem2 : function(parent, id, desc, link) {

    	if (!parent)
        throw new Error( "No parent element passed");
        
    	// Remove any existing element, in case an elemet changes from
      // pending to clean, unkown or unsafe
      var elm = document.getElementById(id);
      if (elm)
        elm.parentNode.removeChild(elm);
      
      var self = this;
      
      var item = document.createElement("label");
      item.setAttribute( "id", id);
      item.setAttribute( "value", desc );
      
      
      if (link) {
      	item.setAttribute( "class", "text-link" );
      	item.addEventListener("click", function() { self.openReport( link ); }, false);
      }
        
      parent.appendChild(item);
   	
    },
    
    _addItem : function(type, report, desc) {
    	
    	var engine = this._getEngine( report ); 	
    	var parent = document.getElementById( "secondOpinion"+engine+type);
    	
    	var id = this._generateId(engine, report.getResource()); 
 
    	this._addItem2(parent, id, desc, report.getLink());
    	
    	
    },

    _showWarningBar : function () {
      document.getElementById("secondOpinionWarningBar").hidden = false;
      document.getElementById("secondOpinionBar").hidden = false;
    },
  
    addSuspicious : function( report ) {

    	if (!report.getResource)
    	  throw new Error("Report"+report.toSource());
    	
    	var desc = "" + report.getPrettyName() + " ("+report.getPositives()+"/"+report.getTotal()+")";
      this._addItem( "Suspicious", report, desc);
      
      this._showWarningBar();
    },
    
    addPending : function( report ) {
    	
    	var desc = "" + report.getPrettyName() + " ( pending... )";
    	this._addItem( "Pending", report, desc );
    	
    	this._showWarningBar();
    },
    
    _addItem3 : function(type, engine, resource, desc) {
    	
    	engine = this._getEngine( engine ); 
    	
    	var parent = document.getElementById( "secondOpinion"+engine+type);
      var id = this._generateId(engine, resource); 
      
      this._addItem2(parent, id, desc); 
      
      
    },
        
    addError : function( engine, resource, prettyName ) {
    	
    	if (typeof(prettyName) === "undefined")
    	  prettyName = resource;
    	  
    	var desc = "" + prettyName + " ( error )";
    	this._addItem3( "Error", engine, resource, desc );
    	
    	this._showWarningBar();
    },
    
    addUnknown : function( report, resource ) {

      var engine = this._getEngine( report.getEngine() ); 
      var parent = document.getElementById( "secondOpinion"+engine+"Loading");

      var id = this._generateId(engine, resource); 
      
      var desc = "" + report.getPrettyName() + " ( unknown )";    
      
      this._addItem2(parent, id, desc); 
 
      var SETTINGS = net.tschmid.secondopinion.SETTINGS;
      
      if (!SETTINGS.isUnknownResourceSafe())
    	  this._showWarningBar();
    },
    
    addClean : function ( report ) {
    	
    	var desc = "" + report.getPrettyName() + " ( Probably harmless )";
    	this._addItem( "Clean", report, desc );
    },
    
    addLoading : function ( engine, resource, prettyName)  {
    
    	engine = this._getEngine( engine ); 
    	var parent = document.getElementById( "secondOpinion"+engine+"Loading");
    	    	
      var id = this._generateId(engine, resource); 
      
      if (typeof(prettyName) === "undefined")
        prettyName = resource;
        
      var desc = ""+prettyName+" ( waiting for result ...)";
 
      this._addItem2(parent, id, desc); 
    }, 
    
    _clearChildren : function(id) {
      var elm = document.getElementById(id);
      while (elm.hasChildNodes())
        elm.removeChild(elm.firstChild);
    },
           
    clearMessages : function() {

    	var elm = null;
      var SETTINGS = net.tschmid.secondopinion.SETTINGS;
    	
    	elm = document.getElementById("secondOpinionVirusTotal");
    	elm.hidden = !SETTINGS.isVirusTotalEnabled();
    	
    	elm = document.getElementById("secondOpinionMetascan");
    	elm.hidden = !SETTINGS.isMetascanEnabled();
    	
      this._clearChildren("secondOpinionVirusTotalSuspicious");
      this._clearChildren("secondOpinionVirusTotalPending");
      this._clearChildren("secondOpinionVirusTotalError");
      this._clearChildren("secondOpinionVirusTotalUnknown");
      this._clearChildren("secondOpinionVirusTotalClean");
      this._clearChildren("secondOpinionVirusTotalLoading");

      this._clearChildren("secondOpinionMetascanSuspicious");
      this._clearChildren("secondOpinionMetascanPending");
      this._clearChildren("secondOpinionMetascanError");
      this._clearChildren("secondOpinionMetascanUnknown");
      this._clearChildren("secondOpinionMetascanClean");  
      this._clearChildren("secondOpinionMetascanLoading");
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