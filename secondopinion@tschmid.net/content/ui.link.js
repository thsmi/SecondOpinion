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
    }
	
  }
  
  net.tschmid.secondopinion.ui.links = new SecondOpinionLinkUi(); 
  
}());   