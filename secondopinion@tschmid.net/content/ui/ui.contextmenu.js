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
  /* global gContextMenu */
  
  function SecondOpinionContextMenuUi() {}

  SecondOpinionContextMenuUi.prototype = {   
    
    load : function() {
      
      var elm = document.getElementById("mailContext");
      if (elm)
        elm.addEventListener("popupshowing", this.onPopupShowing, false);
      
      elm = document.getElementById("secondOptinionViewUrl");
      if (elm)
        elm.addEventListener("command", this.onViewUrl, false);
    },
    
    unload : function() {
      
      var elm = document.getElementById("mailContext");
      if (elm)      
        elm.removeEventListener("popupshowing", this.onPopupShowing, false);
      
      elm = document.getElementById("secondOptinionViewUrl");
      if (elm)
        elm.removeEventListener("command", this.onViewUrl, false);      
    },
    
    onPopupShowing : function () {
      
      var show = true;      
      // in case we have no information about the menu, or we are in threadpane 
      // or it's a mailto link we hide the context menu. 
      if (!gContextMenu || !gContextMenu.linkURL || gContextMenu.inThreadPane || gContextMenu.onMailtoLink)
        show = false;
          
      document.getElementById("secondOptinionViewUrl").hidden = !show;
    },
    
    onViewUrl : function () {
      if (!gContextMenu || !gContextMenu.linkURL)
        return; 
      
      secondOpinion.onViewUrl(gContextMenu.linkURL);
    }
  };
  
  net.tschmid.secondopinion.ui.contextmenu = new SecondOpinionContextMenuUi(); 
  
}()); 