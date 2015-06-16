"use strict";

// TODOs:
//  * Add License header..
//
//  * Dim Message/Attchment on Danger?
// 
//  * Handle multiple file upload.  
//
//  * Use ssdeep hashes.
//
//  * Block files which are beeing scanned...
//
//  * Check email addresses for suspicous domains.
// 
//  * 1085382 dynamic Phishing was removed...
//
//  * public White List
//
//  * dialog/tab which shows all data stored...
//
//  * make scan engine blacklist configurable.
//
//  * progressbar while scanning...


var secondOpinion = {
    
  onLoad: function() {    
    secondOpinion.getInitApi().load( )  
  },
  
  onUnload : function() {
    secondOpinion.getInitApi().unload();
  },
  
  hideErrors : function() {
    secondOpinion.getMessageApi().hideErrors(); 
  },
  
  hideWarnings : function() {
    secondOpinion.getMessageApi().hideWarnings(); 
  },
  
  onViewAttachments : function(items) {
	secondOpinion.getFileApi().openReportByAttachment(items);
  },
  
  // Scanning files...
  onScanAttachments: function(items) {
     
    if (!Array.isArray(items))
      return;
      
    if (items.length == 0)
      return;
         
/*    let urls = [];
    for( index in items ) {      
      let item = {};
      item.name =  items[index].name;
      item.url =  items[index].url;
      
      urls.push(item);
    }*/
    
    let item = [];
    
    item[0] = {
      name : ""+items[0].name,
      url  : ""+items[0].url
    };
 
    window.openDialog("chrome://secondopinion/content/uploader.xul","","chrome",item);                
  },
  
  onViewUrl : function(url) {	 
    secondOpinion.getUrlApi().openReportByUrl(url);  
  },
  
  showDetails: function(offsetX, offsetY) {
    var panel = document.getElementById('secondOpinionDetailPanel');    
    var warning = document.getElementById('secondOpinionWarning');
    
    panel.openPopup(warning,'after_start',offsetX,offsetY);
  },
  
  // API References...
  
  getMessageApi : function() {
    if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.messages)
      throw "Failed to import messages";
    
    return net.tschmid.secondopinion.ui.messages;
  },
  
  getFileApi : function() {
    if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.file)
      throw "Overlay.js Failed to import file";
  
    return net.tschmid.secondopinion.ui.file;
  },    
  
  getUrlApi : function() {
    if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.url)
      throw "Failed to import url";
  
    return net.tschmid.secondopinion.ui.url;
  },  

  getRequestApi : function() {
    if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.requests )
      throw "Failed to import requests";
  
    return net.tschmid.secondopinion.requests;        
  },
  
  getInitApi : function() {
    if (!net || !net.tschmid || !net.tschmid.secondopinion || !net.tschmid.secondopinion.ui || !net.tschmid.secondopinion.ui.init )
      throw "Failed to import requests";
    
    return net.tschmid.secondopinion.ui.init
  }
}

window.addEventListener( 'load', function() { secondOpinion.onLoad(); }, false );
