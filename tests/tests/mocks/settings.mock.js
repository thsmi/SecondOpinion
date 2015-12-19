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
    throw "Could not append mocked logger to test suite";
  
  if (!exports.net)
    exports.net = {};

  if (!exports.net.tschmid)
    exports.net.tschmid = {};

  if (!exports.net.tschmid.secondopinion)
    exports.net.tschmid.secondopinion = {};   
    
  exports.net.tschmid.secondopinion.SETTINGS = {
    isMetascanEnabled : function() { return true; },
    getMetascanApiKey : function() { return "test"; }
  };
  
}(window));
