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
  
    
  function onAttachmentLoaded(name, chunks) { 
    net.tschmid.secondopinion.files.uploadFile(name, chunks, onUploadCompleted, onUploadProgress);
  }

  function scanFile(url, name) {
    
    if (!url || !name)
      return;
  
    document.getElementById("status").textContent 
      = "Preparing "+name+" for upload...";

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

  
  function onUploadProgress(name, event) {
  
    var elm = document.getElementById('secondOpinionUploadProgress');
	
    if (!event.lengthComputable) {
	  elm.mode = 'undetermined';
	  return;
	}
	
	elm.mode = 'determined';
	elm.value = Math.round((event.loaded / event.total)*100);	
	
	document.getElementById("status").textContent 
	    = "Uploading "+name+"... "+elm.value+" %";			
  } 
  
  function onUploadCompleted(name, response) {

    var resp = JSON.parse(response.responseText);
	
    var url = resp["permalink"];
	
    var item = document.getElementById("status2");
    item.textContent = "" +name;			
    item.addEventListener("click", function() { net.tschmid.secondopinion.ui.links.openUrl(url); }, false);		
	
    net.tschmid.secondopinion.CACHE.storeReport(resp["sha256"], true, url);
	
    document.getElementById("UploadWizard").canAdvance = true;
  } 
  

  function doCancel(){
    net.tschmid.secondopinion.SESSION.reset();
    return true;
  }

  function onWindowLoaded() {
    document.getElementById("UploadWizard").getButton("back").hidden = true;
  }

  window.addEventListener( 'load', onWindowLoaded,false);