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
  
  // We have multiple and concurrent request running at the same time...
  // ... this so we should keep track of them...

  function SecondOpinionRequest() {}

  SecondOpinionRequest.prototype = {	

    items : {},
	
    add: function(prefix, name, request) {
      
      var self = this;
	  
	    if (Array.isArray(name)) {
	      name.forEach( function(item) { self.add(prefix, item, request);} );
		    return;
	    }
		
      this.abort(name);
      
      if(!this.items[prefix])
        this.items[prefix] = {};
      
      this.items[prefix][name] = request;  
    },

    remove : function(prefix, name) {
      
      var self = this;
		
	    if (Array.isArray(prefix, name)) {
	      name.forEach( function(item) { self.remove(item);} );
		    return;
	    }		
		
      if (!this.items[prefix])
        return;

      delete this.items[prefix][name];	  
	  },
	
	  abort: function(prefix, name) {
      
	    if ( (typeof(prefix) === "undefined") && (typeof(name) === "undefined") ) {
        
        for (prefix in this.items)
          for (name in this.items[prefix])
            this.abort(prefix, name);      
      }

      if (!this.items[prefix] || !this.items[prefix][name])
        return;
      
      this.items[prefix][name].abort();
	    this.remove(prefix, name);
	  },
	
	  /**
	    * a reset call aborts all pending requests.
	    **/
	  reset : function() {
	    this.abort();
	  }
  };

  if (!exports.net)
    exports.net = {};

  if (!exports.net.tschmid)
    exports.net.tschmid = {};

  if (!exports.net.tschmid.secondopinion)
    exports.net.tschmid.secondopinion = {};  
  
  // Export an instance to the global Scope  
  exports.net.tschmid.secondopinion.requests = new SecondOpinionRequest(); 
   
}(this));
