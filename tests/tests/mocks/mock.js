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

/* global window */

(function(exports) {
  
  /* global net */
  
  var suite  = net.tschmid.yautt.test;

  if (!suite)
    throw "Could not append Mocked XMLHttpRequest to test suite";

  if (!suite.mock)
    suite.mock = {};
  

  function MockArgumentEquals(value){
    this._value = value;
  }

  MockArgumentEquals.prototype.equals 
    = function( value ) 
  {
    return (this._value === value);
  };

  
  
  function MockArgumentCapture(){
    this._value = null;
  }

  MockArgumentCapture.prototype.equals 
    = function( value ) 
  {
    this._value = value;
    return true;
  };   
   
  MockArgumentCapture.prototype.getValue
    = function ()
  {
    return this._value ; 	
  };
   
  // -----------------
  function MockArgumentAny() {
  }
   
  MockArgumentAny.prototype.equals
    = function( )
  {
    return true;
  };
   
   
  //-------------------

  function MethodMock( method, mock ) {
    this._results = [];
    this._args = [];
    this._mock = mock;
    this._method = method;
  }

  MethodMock.prototype.thenReturnThis 
    = function( count ) 
  {  	
    this.thenReturn(this._mock, count);  	
    return this;
  };
    
    
  MethodMock.prototype.thenReturn 
    = function( returnable, count )
  {
    if (typeof(count) === "undefined")
      count = -1;     	
    
    var result = {
      count : count,
      callback : function() { return returnable; }
    };

    this._results.push( result );
    return this;
  };
    
    
    
  MethodMock.prototype.doThrow
    = function ( throwable, count )
  {
    if (typeof(count) === "undefined")
      count = -1; 
    	
    var result = {
      count: count,
      callback : function() { throw throwable; }
    };
    	
    this._results.push( result );
    return this;
  };
    
  MethodMock.prototype.invoke
    = function (args)
  {
        
    // save the arguments, so that hey can be evaluated by verify.
    this._args.push(args);
    
    if (this._results.length === 0)
      return;
      
    var result = this._results[0];
     
    if (result.count === 1)
      this._results.shift();
      
    if (result.count > 0)
      result.count--;
        
    return result.callback();
  };


  /**
   * Ensures that the method was never called
   * with the given parameters
   * 
   * @params {array} expected
   *   the expected parameters
   *   
   */
  MethodMock.prototype.verify
    = function (expected, offset)
  {
    if(!this._args || !this._args.length)
      throw new Error("Method "+this._method+" never invoked");
    	
    if (offset >= this._args.length)
      throw new Error("Method "+this._method+" was only invoked "+this._args.length+" time(s)");      	
    		
    for (var i=0; i< expected.length; i++)
      if (!expected[i].equals(this._args[offset][i]))
        throw new Error("Invalid Argument : Expected "+expected[i]+" but got "+ this._args[offset][i] + " in Method "+this._method+" ");         
        
    return true;
  };
      
        
  
  /**
   * Creates a new mock 
   */
  function Mock(mock) {
    this._methods = {};
    
    if (typeof(mock) === "undefined")
      mock = {};
    this._mock = mock;
  }
    
  Mock.prototype.when 
    = function(name, replace) {
      
    if ((typeof(replace) === "undefined") || (replace === null))
      replace = false;
      	
    if (this._methods[name] && !replace) 
      return this._methods[name];
        
    this._methods[name] = new MethodMock(name, this._mock);
      
    var that = this;
    this._mock[name] = function (/* arguments */) {
      return that._methods[name].invoke(arguments);  
    };
      
    return this._methods[name];
  };
    
  Mock.prototype._createVerifyCallback
    = function(result, method) {
     
    var that = this;
      
    if (!result._refcount)
      result._refcount = {};
        
    result._refcount[method] = 0;
      
    return function(args) {
      that._methods[method].verify( arguments, result._refcount[method] );
      result._refcount[method]++;
      return result;
    };
  };
    
    
  Mock.prototype.getMock
    = function() {
    return this._mock;
  };
    
  Mock.prototype.verify
    = function() {
        
    var result = {};
    var that = this;
     
    for ( var item in this._methods) {
      result[item] = this._createVerifyCallback(result, item);
    }     
     
    return result;
  };    
      
  suite.mock.Mock = Mock;
   
  suite.mock.EQ = function(value) { return new MockArgumentEquals(value); };
  suite.mock.ANY = function() { return new MockArgumentAny(); };
  suite.mock.Capture = MockArgumentCapture;
    
}(window));