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
/* global document */
/* global net */

"use strict";
  
  if (!net.tschmid.secondopinion.LOGGER)
    throw "Failed to import LOGGER";
  
  var LOGGER = net.tschmid.secondopinion.LOGGER;
  
    
  function onAttachmentLoaded(name, chunks) {
  	
  	LOGGER.logDebug("onAttachmentLoaded");
  	
    var SETTINGS = net.tschmid.secondopinion.SETTINGS;

    if (SETTINGS.isMetascanEnabled())
      net.tschmid.secondopinion.metascan.FILE.uploadFile(name, chunks, onMetascanUploadCompleted, onMetascanUploadProgress);
    
    if (SETTINGS.isVirusTotalEnabled())
  	  net.tschmid.secondopinion.virustotal.FILE.uploadFile(name, chunks, onVirusTotalUploadCompleted, onVirusTotalUploadProgress);
  	
  }

  function scanFile(url, name) {
    
    if (!url || !name)
      return;

    var SETTINGS = net.tschmid.secondopinion.SETTINGS;
      
    document.getElementById("VirusTotalUploadStatus").textContent 
      = ( SETTINGS.isMetascanEnabled() ?  "Preparing "+name+" for upload..." : "VirusTotal is disabled" );

    document.getElementById("MetascanUploadStatus").textContent 
      = ( SETTINGS.isMetascanEnabled() ?  "Preparing "+name+" for upload..." : "Metascan is disabled" );
      
    net.tschmid.secondopinion.attachments.getAttachment(url, name, onAttachmentLoaded);  
  }

  function startUpload() {
  
    var items = window.arguments[0];
	
	  if (!items) 
	    return;
	
	  if (!Array.isArray(items)) {
	    scanFile(""+items.url, ""+items.name);
	    return;
	  }
	
    for(var index in items ) {  
      var item = items[index]; 
      scanFile(""+item.url, ""+item.name);
    }  
	
	  document.getElementById("UploadWizard").canAdvance = false;
  }

  
  function onVirusTotalUploadProgress(name, event) {
  	onUploadProgress("VirusTotal", name, event);
  }
  
  function onVirusTotalUploadCompleted(name, response) {
    LOGGER.logDebug("upload completed"+response.responseText);
    var resp = JSON.parse(response.responseText);
  
    var url = resp["permalink"];
  
    var item = document.getElementById("virusTotalFileLink");
    item.textContent = 'View Status at VirtuTotal.com "' +name +'"';      
    item.addEventListener("click", function() { net.tschmid.secondopinion.ui.links.openUrl(url); }, false);   
  
    //net.tschmid.secondopinion.CACHE.storeReport(resp["sha256"], true, url);
  
    document.getElementById("UploadWizard").canAdvance = true;  	
  }

  function onMetascanUploadProgress(name, event) {
    onUploadProgress("Metascan", name, event);
  }

  function onMetascanUploadCompleted(name, response) {
    LOGGER.logDebug("upload completed"+response.responseText);
    var resp = JSON.parse(response.responseText);
  
    var url = "https://www.metascan-online.com/#!/results/file/"+resp["data_id"]+"/regular";
    //var url = "http://"+resp["rest_ip"]+"/file/"+resp["data_id"];
  
    var item = document.getElementById("metascanFileLink");
    item.textContent = 'View Status at Metascan "' +name+'"';      
    item.addEventListener("click", function() { net.tschmid.secondopinion.ui.links.openUrl(url); }, false);   
  
    //net.tschmid.secondopinion.CACHE.storeReport(resp["sha256"], true, url);
  
    document.getElementById("UploadWizard").canAdvance = true;    
  }
  
  
  function onUploadProgress(engine, name, event) {
    
    var elm = document.getElementById(engine+'UploadProgress');
    var status = document.getElementById(engine+'UploadStatus');
        	
  	
    if (!event.lengthComputable) {
	    elm.mode = 'undetermined';
	    return;
  	}
	
	  elm.mode = 'determined';
	  elm.value = Math.round((event.loaded / event.total)*100);	
	
	  status.textContent 
	    = "Uploading "+name+" to "+engine+" ... "+elm.value+" %";			
  } 
  

  

  function doCancel(){
    net.tschmid.secondopinion.SESSION.reset();
    return true;
  }

  function onWindowLoaded() {
    document.getElementById("UploadWizard").getButton("back").hidden = true;
  }

  window.addEventListener( 'load', onWindowLoaded,false);