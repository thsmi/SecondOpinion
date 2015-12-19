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
    suite.log("metascan common tests...");
  });    
  
  suite.add( function() {     
    
    suite.log(" * Invalid API Key (401)");

    var response = {
      status : 401
    };

    var metascan = new net.tschmid.secondopinion.metascan.AbstractResponse();
   
    var result = metascan.parse(response);
    suite.assertEquals(result, metascan);
    
    suite.assertEquals( metascan.getError().getMessage() , 
        "Your Metascan.com api key is invalid! Open the addon manager and enter a valid key in the extension's options");
  });

  suite.add( function() {   
 
    suite.log(" * General Server Error");

    var response = {
      status : 402
    };

    var metascan = new net.tschmid.secondopinion.metascan.AbstractResponse();
   
    var result = metascan.parse(response);
    suite.assertEquals(result, metascan);
    
    suite.assertEquals( metascan.getError().getMessage() , 
        "Metascan encountered an server error (402)");   
      
  });
  
  suite.add( function() {   
 
    suite.log(" * Quota exceeded (403)");
    
    var response = {
      status : 403
    };

    var metascan = new net.tschmid.secondopinion.metascan.AbstractResponse();
   
    var result = metascan.parse(response);
    suite.assertEquals(result, metascan);
    
    suite.assertEquals( metascan.getError().getMessage() , 
        "The scan result may be incomplete. You reached the hourly Metascan limit. Try later!");

  });  
  
  suite.add( function() {   
 
    suite.log(" * Success (200)");
    
    var response = {
      status : 200,
      responseText : '["REPORT1","REPORT2"]'
    };

    var AbstractResponse = net.tschmid.secondopinion.metascan.AbstractResponse;
  
    function MetascanTestResponse() {        
      AbstractResponse.call(this);
    }
  
    MetascanTestResponse.prototype = Object.create(AbstractResponse.prototype);
    MetascanTestResponse.prototype.constructor = MetascanTestResponse;  
  
    MetascanTestResponse.prototype.createReports = function(data) {    
      return data;
    };
    
    var metascan = new MetascanTestResponse();
   
    var result = metascan.parse(response);
    suite.assertEquals(result, metascan);

    suite.assertEquals( response.responseText, JSON.stringify(metascan.getReports()) );
    suite.assertEquals( null, metascan.getError() );
  });  
  
}(window));

