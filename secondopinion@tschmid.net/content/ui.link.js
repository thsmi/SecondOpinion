"use strict";

if (!Ci)
  var Ci = Components.interfaces;
if (!Cc)
  var Cc = Components.classes;

var net = net || {};

if (!net.tschmid)
  net.tschmid = {};

if (!net.tschmid.secondopinion)
  net.tschmid.secondopinion = {};

if (!net.tschmid.secondopinion.ui)
  net.tschmid.secondopinion.ui = {};

(function() {
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
      
      let tabmail = document.getElementById("tabmail");
      if (!tabmail) {
        // Try opening new tabs in an existing 3pane window
        let mail3PaneWindow = Cc["@mozilla.org/appshell/window-mediator;1"]
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
	}
  
  net.tschmid.secondopinion.ui.links = new SecondOpinionLinkUi(); 
  
}());   