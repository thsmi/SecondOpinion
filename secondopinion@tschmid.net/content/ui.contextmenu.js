"use strict";

var net = net || {};

if (!net.tschmid)
  net.tschmid = {};

if (!net.tschmid.secondopinion)
  net.tschmid.secondopinion = {};

if (!net.tschmid.secondopinion.ui)
  net.tschmid.secondopinion.ui = {};

(function() {
  function SecondOpinionContextMenuUi() {}

  SecondOpinionContextMenuUi.prototype = {   
    
    load : function() {
      
      let elm = document.getElementById("mailContext");
      if (elm)
        elm.addEventListener("popupshowing", this.onPopupShowing, false);
      
      elm = document.getElementById("secondOptinionViewUrl");
      if (elm)
        elm.addEventListener("command", this.onViewUrl, false);
    },
    
    unload : function() {
      let elm = document.getElementById("mailContext");
      if (elm)      
        elm.removeEventListener("popupshowing", this.onPopupShowing, false);
      
      elm = document.getElementById("secondOptinionViewUrl");
      if (elm)
        elm.removeEventListener("command", this.onViewUrl, false);      
    },
    
    onPopupShowing() {
      
      let show = true;      
      // in case we have no information about the menu, or we are in threadpane 
      // or it's a mailto link we hide the context menu. 
      if (!gContextMenu || !gContextMenu.linkURL || gContextMenu.inThreadPane || gContextMenu.onMailtoLink)
        show = false;
          
      document.getElementById("secondOptinionViewUrl").hidden = !show;
    },
    
    onViewUrl() {
      if (!gContextMenu || !gContextMenu.linkURL)
        return; 
      
      secondOpinion.onViewUrl(gContextMenu.linkURL);
    }
  }
  
  net.tschmid.secondopinion.ui.contextmenu = new SecondOpinionContextMenuUi(); 
  
}()); 