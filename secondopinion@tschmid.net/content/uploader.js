 "use strict";
  
  function startUpload() {
  
    let items = window.arguments[0];
	
	if (!items) 
	 return;2
	
	if (!Array.isArray(items)) {
	  scanFile(""+item.url, ""+item.name);
	  return;
	}
	
    for(let index in items ) {  
      let item = items[index]; 
	  scanFile(""+item.url, ""+item.name);
    }  
	
	document.getElementById("UploadWizard").canAdvance = false;
  }
  
  function scanFile(url, name) {
  
	if (!url || !name)
	  return;
	
	document.getElementById("status").textContent 
	    = "Preparing "+name+" for upload...";
	
	
	net.tschmid.secondopinion.attachments.getAttachment(url, name, onAttachmentLoaded);  
  }
  
  function onAttachmentLoaded(name, chunks) {	
    net.tschmid.secondopinion.files.uploadFile(name, chunks, onUploadCompleted, onUploadProgress);
  }
  
  function onUploadProgress(name, event) {
  
    let elm = document.getElementById('secondOpinionUploadProgress');
	
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

	let resp = JSON.parse(response.responseText);
	
	let url = resp["permalink"];
	
	let item = document.getElementById("status2");
	item.textContent = "" +name;			
    item.addEventListener("click", function() { net.tschmid.secondopinion.ui.links.openUrl(url); }, false);		
	
	net.tschmid.secondopinion.reports.storeReport(resp["sha256"], true, url);
	
	document.getElementById("UploadWizard").canAdvance = true;
  } 
  

function doCancel(){
  net.tschmid.secondopinion.requests.reset();
  return true;
}

function onWindowLoaded() {
  document.getElementById("UploadWizard").getButton("back").hidden = true;
}

window.addEventListener( 'load', onWindowLoaded,false);