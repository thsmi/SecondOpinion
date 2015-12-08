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

(function(exports) {
  
  /* global Components */
  /* global Services */
  /* global XPCOMUtils */
  /* global Uint8Array */
  
  /* global currentAttachments */
  
  var Cu = Components.utils;
  var Ci = Components.interfaces;
  var Cc = Components.classes;

  Cu.import("resource://gre/modules/Services.jsm");  
  Cu.import("resource://gre/modules/NetUtil.jsm");  
  Cu.import("resource://gre/modules/XPCOMUtils.jsm"); 
  
  function SecondOpinionAttachments() {}

  SecondOpinionAttachments.prototype = {  
  
    getAttachment : function(url, name, callback) {
       
      var channel = Services.io.newChannelFromURI(Services.io.newURI(url, null, null));  
    
      var chunks = [];
    
      var listener = {  
        onStartRequest: function (request, context) {  },  
    
        onDataAvailable: function (request, context, inputStream, offset, count) {  
          var binaryInStream = Cc["@mozilla.org/binaryinputstream;1"]
                                   .createInstance(Ci.nsIBinaryInputStream);
    
          binaryInStream.setInputStream(inputStream);
    
        var data = binaryInStream.readByteArray(count); 
        var bytes = new Uint8Array(count);
    
        bytes.set(data);
        chunks.push(bytes); 
        },  
    
        onStopRequest: function ( request, context, statusCode) {  
          window.setTimeout(function() { callback(name, chunks); }, 0); 
        },  
    
        QueryInterface: XPCOMUtils.generateQI([Ci.nsISupports, Ci.nsIStreamListener, Ci.nsIRequestObserver])  
      };
    
      channel.asyncOpen(listener, null);
    },

    getAttachmentCheckSum : function(url, name, callback) {
    
      var channel = Services.io.newChannelFromURI(
                    Services.io.newURI(url, null, null));  
    
      var ch = Cc["@mozilla.org/security/hash;1"]
                     .createInstance(Ci.nsICryptoHash);
      ch.init(ch.SHA256);
    
      var listener = {  
        onStartRequest: function (request, context) {  },  
    
        onDataAvailable: function (request, context, inputStream, offset, count) {  
          ch.updateFromStream(inputStream, count);
        },  
    
        onStopRequest: function ( request, context, statusCode) {  
        var hash = ch.finish(false);
      
          function toHexString(charCode) {
            return ("0" + charCode.toString(16)).slice(-2);
          }
      
          // convert the binary hash data to a hex string.
          var s = [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
    
          window.setTimeout(function() { callback(url, name, s); }, 0); 
        },  
    
        QueryInterface: XPCOMUtils.generateQI([Ci.nsISupports, Ci.nsIStreamListener, Ci.nsIRequestObserver])  
      };
    
      channel.asyncOpen(listener, null);
    },
  
    /**
   *  @result{AttachmentInfo[]} attachments
     *    a reference to thunderbird's attachment list.
   */
    getCurrentAttachments : function() {
     // Current Attachments is a global variable...
     if (!currentAttachments)
       return [];
   
     return currentAttachments;
  },
  
    blockSaveAttachment : function(attachment) {

      // Save the old method...
      var save = attachment.save;
      
      // ... and replace it with a proxy.
      attachment.save = function() {
      
        var prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Ci.nsIPromptService);
              
        var check = {value: false};    // default the checkbox to false   
        var flags = prompts.STD_YES_NO_BUTTONS;
      
        var button = prompts.confirmEx(null, "Second Opinion - Confirm save", 
                               "Do you really want to save the attachment?",
                               flags, "", null, "", null, check);
    
        if (button !== 0)
          return;
        
        save.call(attachment);
      };
    },
  

    blockOpenAttachment : function(attachment) {
     
      // Save the old method...
      var open = attachment.open;
      
      // ... and replace it with a proxy.   
      attachment.open = function() {
    
        var prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Ci.nsIPromptService);
              
        var check = {value: false};    // default the checkbox to false   
        var flags = prompts.STD_YES_NO_BUTTONS;
    
        var button = prompts.confirmEx(null, "Second Opinion - Confirm open", 
                               "Do you really want to open the attachment?",
                               flags, "", null, "", null, check);
    
        if (button !== 0)
          return;
        
        open.call(attachment);
      };      
    },
  
    /**
     * Thunderbird uses a global attachment list which contains attachment info objects
     * to track all open attachments.
     *
     * We need to override the open as well as the save method for potentially dangerous 
     * attachments.
     *
     *  @param{String} url
     *    the attachment's uri, which should be blocked. It is not the virus total url!
     **/
    blockAttachment : function(url) {
      
      var attachments = this.getCurrentAttachments();
      
      for( var index in attachments ) {       
  
        if (attachments[index].url != url)
          continue;
          
        this.blockOpenAttachment(attachments[index]);
        this.blockSaveAttachment(attachments[index]);
        
        // we found our attachment which means we can skip.
        return;
      }
    } 
  };
 
  if (!exports.net)
    exports.net = {};

  if (!exports.net.tschmid)
    exports.net.tschmid = {};

  if (!exports.net.tschmid.secondopinion)
    exports.net.tschmid.secondopinion = {};  
 
  // Export an instance to the global Scope  
  exports.net.tschmid.secondopinion.attachments = new SecondOpinionAttachments();  
     
}(this));
