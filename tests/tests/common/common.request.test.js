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
  
  var suite  = exports.net.tschmid.yautt.test;
    
  if (!suite)
    throw "Could not initialize test suite";

  suite.add( function() {   
    suite.log("SESSION and AbstractRequest tests...");
    
    if (!net.tschmid.secondopinion.SESSION)
      throw "Failed to import SESSION object";
  });    
  
  suite.add( function() {     

    suite.log(" * Testing Session manipulation");
  	
  	var REQUEST_1 = {
  		state : false,
  		abort : function() { this.state = true; }
  	};
  	
  	var REQUEST_2 = {
  		state : false,
  		abort : function() { this.state = true; }
  	};
    
  	var SESSION = net.tschmid.secondopinion.SESSION;
  	var result = null;
  	
  	suite.assertEquals( 0, SESSION.size() );
  	
  	result = SESSION.add( REQUEST_1 );
  	suite.assertEquals( result, SESSION );
  	suite.assertEquals( 1, SESSION.size() );

  	result = SESSION.add( REQUEST_2 );
  	suite.assertEquals( result, SESSION );
  	suite.assertEquals( 2, SESSION.size() );
  	
  	result = SESSION.add( REQUEST_1 );
  	suite.assertEquals( result, SESSION );
  	suite.assertEquals( 2, SESSION.size() );
  	
    result = SESSION.remove( REQUEST_1 );
    suite.assertEquals( result, SESSION );
    suite.assertEquals( 1, SESSION.size() );
    
    result = SESSION.add( REQUEST_1 );
    suite.assertEquals( result, SESSION );
    suite.assertEquals( 2, SESSION.size() );

    result = SESSION.add( REQUEST_2 );
    suite.assertEquals( result, SESSION );
    suite.assertEquals( 2, SESSION.size() );

    suite.assertEquals( false, REQUEST_1.state);
    suite.assertEquals( false, REQUEST_2.state);      
    
    result = SESSION.reset();
    suite.assertEquals( result, SESSION );
    suite.assertEquals( 0, SESSION.size() );
    
    // Ensure abort was called...
    suite.assertEquals( true, REQUEST_1.state);
    suite.assertEquals( true, REQUEST_2.state);
  });

  suite.add( function() {     
    
    var SESSION = net.tschmid.secondopinion.SESSION;
 
    suite.log(" * Adding invalid element");
    
    suite.assertEquals( 0, SESSION.size() );
    
    try {
      SESSION.add("test");
    } catch (e) {
    	return;
    }
    
    throw "Exception expected";
  });
  
  
  suite.add( function() {

    suite.log(" * Send Request");

    var result = null;
    
    var EQ = suite.mock.EQ;
    var ANY = suite.mock.ANY;  
    
    var mock = new suite.mock.Mock( { upload : {} } );
    mock.when("open");
    mock.when("send");
    mock.when("setRequestHeader");
    mock.when("abort");   
    

    var SESSION = net.tschmid.secondopinion.SESSION;
     	  	  	
  	var state = {
  		progress : false,
  		completed : false
  	};
  	
  	var request = new net.tschmid.secondopinion.Request();
  	
  	// Inject Mock
  	request._createXMLHttpRequest = function() {
  		return mock.getMock();
  	};
  	
  	suite.assertEquals( 0, SESSION.size() );
  	
    // set upload progress handler
  	result = request.setUploadProgressHandler( function() { state.progress = true; } );
  	suite.assertEquals( result, request );
  	
  	// set Completed handler
  	result = request.setCompletedHandler( function() { state.completed = true; } );
  	suite.assertEquals( result, request );
  	
  	// set header
  	result = request.setHeader( "TEST", "ABC" );
  	suite.assertEquals( result, request );
  	result = request.setHeader( "TEST", "CDE" );
  	suite.assertEquals( result, request );
  	
  	result = request.setHeader( "TEST2", "EFG" );
  	suite.assertEquals( result, request );

  	// send URL and DATA
  	result = request.send( "POST", "URL","DATA" );
  	suite.assertEquals( result, request );
  	
  	mock.verify()
  	  .open( EQ("POST"), EQ("URL"))
  	  .send( EQ("DATA"))
  	  .setRequestHeader( EQ("TEST"), EQ("CDE"))
  	  .setRequestHeader( EQ("TEST2"), EQ("EFG"));
  	  
  	suite.assertEquals( 1, SESSION.size() );

  	mock.getMock().upload.onprogress();
  	suite.assertEquals( true, state.progress );
  	
  	mock.getMock().onload();
  	suite.assertEquals( true, state.completed );
  	
  	suite.assertEquals( 0, SESSION.size() );
  });
  
}(window));
