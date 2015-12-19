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
	
	/* global XMLHttpRequest */
	/* global net */
  	
	function SecondOpinionRequest() {
	  this._headers = {};
	}

  SecondOpinionRequest.prototype._createXMLHttpRequest
    = function() {
    return new XMLHttpRequest();
  };	
	
	SecondOpinionRequest.prototype.setUploadProgressHandler
	  = function( progressHandler) {

	  this._onProgressListener = progressHandler;
	  return this;
	};
	
  SecondOpinionRequest.prototype.setCompletedHandler
    = function( completedHandler ) {

    this._onCompletedListener = completedHandler;
    return this;
  };
  
  SecondOpinionRequest.prototype.setHeader
    = function( name, value) {
    	
    this._headers[name] = value;
    return this;
  };
 

  SecondOpinionRequest.prototype.send
    = function(type, url, data) {
    
    var request = this._createXMLHttpRequest();
 
    request.open(type, url);
    
    var that = this;
    
    // Add event listeners...
    request.onload = function( ) {
      
    	net.tschmid.secondopinion.SESSION.remove(request);
      
      net.tschmid.secondopinion.LOGGER
        .logDebug(this.responseText);
      
      if (that._onCompletedListener)
        that._onCompletedListener(this);
    };   
    
    if (this._onProgressListener) 
      request.upload.onprogress = this._onProgressListener;
    
    for (var key in this._headers)
      request.setRequestHeader(key, this._headers[key]);
    	
    request.send(data);
    
    net.tschmid.secondopinion.SESSION.add(request);
    
    return this;
  };

  // In case the user switches between mails we need to cancel all 
  // existing request otherwise they could queue up. 
  // But as we have multiple and concurrent request 
  // running at the same time we need to keep track of them.

  function SecondOpinionSession() {
  	
    this._items = new Set();
  }
  
  SecondOpinionSession.prototype.reset
    = function() {
  
    // Abort should be called exaclty once. 
    // Thus we rotate the buffers as first step 
    var tmp = this._items;
    this._items = new Set();
    
    tmp.forEach(function(item) {
    	item.abort();
    });
    
    tmp.clear();
    
    return this;
  };
  
  SecondOpinionSession.prototype.size
    = function() {
    return this._items.size;
  };
  
  SecondOpinionSession.prototype.add
    = function(request) {
    
    if (!request.abort)
      throw "Invalid request object";
    	
    this._items.add(request);
    
    return this;
  };
  
  SecondOpinionSession.prototype.remove
    = function(request) {
    this._items.delete(request);
    
    return this;
  }; 
  
	

  if (!exports.net)
    exports.net = {};

  if (!exports.net.tschmid)
    exports.net.tschmid = {};

  if (!exports.net.tschmid.secondopinion)
    exports.net.tschmid.secondopinion = {};  
  
  // Export an instance to the global Scope  
  exports.net.tschmid.secondopinion.SESSION = new SecondOpinionSession();
  exports.net.tschmid.secondopinion.Request = SecondOpinionRequest; 
   
}(this));
