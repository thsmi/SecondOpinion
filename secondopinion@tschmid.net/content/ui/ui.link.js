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
  
  /* global Components */
  /* global document */
  
  var Ci = Components.interfaces;
  var Cc = Components.classes;  
  
  function SecondOpinionLinkUi() {}  
  
  SecondOpinionLinkUi.prototype = {
	  
    openUrl : function(url) {
      var ioservice = Cc["@mozilla.org/network/io-service;1"]
                            .getService(Ci.nsIIOService);

      var uriToOpen = ioservice.newURI(url, null, null);

      var extps = Cc["@mozilla.org/uriloader/external-protocol-service;1"]
                      .getService(Ci.nsIExternalProtocolService);

      extps.loadURI(uriToOpen, null);    
    },
    
    openUrlInTab : function(url) {
      
      var tabmail = document.getElementById("tabmail");
      if (!tabmail) {
        // Try opening new tabs in an existing 3pane window
        var mail3PaneWindow = Cc["@mozilla.org/appshell/window-mediator;1"]
                                  .getService(Ci.nsIWindowMediator)
                                  .getMostRecentWindow("mail:3pane");
                                  
        if (mail3PaneWindow) {
          tabmail = mail3PaneWindow.document.getElementById("tabmail");
          mail3PaneWindow.focus();
        }
      }
      
      if (tabmail)
        tabmail.openTab("contentTab", {contentPage: url});
      else
        window.openDialog("chrome://messenger/content/", "_blank", "chrome,dialog=no,all", null,
                    { tabType: "contentTab", tabParams: {contentPage: url} });
      
    }
	};
  
  net.tschmid.secondopinion.ui.links = new SecondOpinionLinkUi(); 
  
}());   