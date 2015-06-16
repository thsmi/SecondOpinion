"use strict";

var net = net || {};

if (!net.tschmid)
  net.tschmid = {};

if (!net.tschmid.secondopinion)
  net.tschmid.secondopinion = {};

(function() {
  
    // We have multiple and concurrent request running at the same time...
    // ... this so we should keep track of them...

  function SecondOpinionRequest() {}

  SecondOpinionRequest.prototype = {	

    items : {},
	
    add: function(name, request) {
	  
	  if (Array.isArray(name)) {
		let self = this;
	    name.forEach( function(item) { self.add(item, request)} );
		return;
	  }
		
      this.abort(name);
      this.items[name] = request;  
    },

    remove : function(name) {
		
	  if (Array.isArray(name)) {
		let self = this;
	    name.forEach( function(item) { self.remove(item)} );
		return;
	  }		
		
      delete this.items[name];	  
	},
	
	abort: function(name) {
	  if (name === undefined) 
       for (let item in this.items)
         this.abort(item);

      if (!this.items[name])
        return;
      
      this.items[name].abort();
	  this.remove(name);
	},
	
	/**
	  * a reset call aborts all pending requests.
	  **/
	reset : function() {
	  this.abort();
	}
  }
 
  // Export an instance to the global Scope  
  net.tschmid.secondopinion.requests = new SecondOpinionRequest();  	  
}());