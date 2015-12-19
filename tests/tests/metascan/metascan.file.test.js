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
  
  var APIKEY = "123456789";
  
  // seting up environment
  var settings = new suite.mock.Mock();    
  net.tschmid.secondopinion.SETTINGS = settings.getMock();
    
  suite.add( function() {   
    suite.log("metascan file tests...");
    
    settings.when("isMetascanEnabled").thenReturn(true);
    settings.when("getMetascanApiKey").thenReturn(APIKEY);
    settings.when("getExcluded").thenReturn([]);
  });    
  
  function verifyFileReport(responseStatus, responseText) {
    var CHECKSUM = "ABCDefg512232";
    var FILENAME = "FILENAME";

    var URL = "https://hashlookup.metascan-online.com/v2/hash/"+CHECKSUM.toLowerCase();
    
    var SERVER_RESPONSE  = {
      status : responseStatus,
      responseText : responseText
    };

    // import static comparators
    
    var EQ = suite.mock.EQ;
    var ANY = suite.mock.ANY;
    
    // Mock the request...
    var request = new suite.mock.Mock();
    
    request.when("send")
      .thenReturnThis();
    request.when("setCompletedHandler")
      .thenReturnThis();
    request.when("setHeader")
      .thenReturnThis();

    // Mock the callback function...
    var callback = new suite.mock.Mock();
    callback.when("onCallback");
      
    
    // Inject the mocks...
    var api = exports.net.tschmid.secondopinion.metascan.FILE;
    
    api._createRequest = function() {
      return request.getMock();
    };
    
    // ... then start the test
    api.getFileReport( FILENAME, CHECKSUM , callback.getMock().onCallback );
   
    // ... verify the correct url was called, and the api key was passed.
    var cb = new suite.mock.Capture();
    
    request.verify()
      .setCompletedHandler(cb)
      .setHeader(EQ("apikey"), EQ(APIKEY))
      .send(EQ("GET"), EQ(URL), EQ(null));
    
    // ... Trigger the callback
    (cb.getValue())(SERVER_RESPONSE);
       
    // and verify it was called
    var response = new suite.mock.Capture();
    callback.verify()
      .onCallback( EQ(FILENAME), EQ(CHECKSUM.toLowerCase()), response);
   
    // and finally the results...
    return response.getValue();
  }
  
  
  suite.add( function() {     
    
    suite.log("getFileReport - Empty Response");

    var STATUS = 200;
    var SCAN_REPORT = '';
  
    var response = verifyFileReport(200, SCAN_REPORT);

    suite.assertNotNull(response.getError());   
    
    var reports = response.getReports();

    suite.assertEquals(0, reports.length);
    //report.getEngine
    //report.getType    
  });  

  suite.add( function() {     
    
    suite.log("getFileReport - Empty Response Object");

    var STATUS = 200;
    var SCAN_REPORT = '{}';
        
    var response = verifyFileReport(200, SCAN_REPORT);
    
    suite.assertNull(response.getError());   
    
    var reports = response.getReports();

    //report.getEngine
    //report.getType
    suite.assertEquals(1, reports.length);
    suite.assertEquals(true, reports[0].hasError());
    
    suite.assertEquals(false, reports[0].isPending());
    suite.assertEquals(false, reports[0].hasReport());
    suite.assertEquals(-1, reports[0].getTotal());

  });  
  
  suite.add( function() {     
    
    suite.log("getFileReport - Report not found");

    //var SCAN_REPORT = "{}";
    //var SCAN_REPORT = "";
    var STATUS = 200;
    var SCAN_REPORT = '{"2CBDCDB44EDF1FF5125895E3CBD8AAE961EF9069B9039339169F8B9DD0F53A1D":"Not Found"}';
    
    var response = verifyFileReport(200, SCAN_REPORT);
   
    suite.assertNull(response.getError());
    
    var reports = response.getReports();
    
    //report.getEngine
    //report.getType
    
    suite.assertEquals(1, reports.length);
    suite.assertEquals(false, reports[0].hasError());
    suite.assertEquals(false, reports[0].isPending());
    suite.assertEquals(false, reports[0].hasReport());
    suite.assertEquals(-1, reports[0].getTotal());
  });

  suite.add( function() {     
    
    suite.log("getFileReport - Report No threat found"); 
    
    var SCAN_REPORT = '{"file_id":"53260b96b20cc614cc798acf","scan_results":{"scan_details":{"AegisLab":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":1607},"Agnitum":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-12T00:00:00Z","scan_time":499},"Ahnlab":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-15T00:00:00Z","scan_time":406},"Antiy":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":1903},"AVG":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":889},"Avira":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":515},"BitDefender":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":1451},"ByteHero":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":1747},"ClamWin":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-13T00:00:00Z","scan_time":1623},"CYREN":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":515},"DrWebGateway":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-15T00:00:00Z","scan_time":1373},"Emsisoft":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":156},"ESET":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":421},"Filseclab":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":3573},"Fortinet":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":1326},"F-prot":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":453},"F-secure":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":1326},"GFI":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":796},"Hauri":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-15T00:00:00Z","scan_time":172},"Ikarus":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":609},"Jiangmin":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":1872},"K7":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":1498},"Kaspersky":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":406},"Lavasoft":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":3448},"McAfee-Gateway":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-15T00:00:00Z","scan_time":1373},"Microsoft":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-13T00:00:00Z","scan_time":1326},"NANO":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":1030},"nProtect":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-13T00:00:00Z","scan_time":63},"Preventon":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":515},"QuickHeal":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":390},"Sophos":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":1139},"STOPzilla":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-13T00:00:00Z","scan_time":3136},"SUPERAntiSpyware":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":1825},"Symantec":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-13T00:00:00Z","scan_time":1014},"Tencent":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-15T00:00:00Z","scan_time":1217},"TotalDefense":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":1139},"TrendMicro":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-13T00:00:00Z","scan_time":1638},"TrendMicroHouseCall":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-13T00:00:00Z","scan_time":1607},"VirIT":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-13T00:00:00Z","scan_time":1513},"VirusBlokAda":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":1061},"Xvirus":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":1373},"Zillya!":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-14T00:00:00Z","scan_time":125},"Zoner":{"scan_result_i":0,"threat_found":"","def_time":"2015-03-13T00:00:00Z","scan_time":874}},"rescan_available":true,"data_id":"3a91ff29b649474c9e80326cafa0c0d5","scan_all_result_i":0,"start_time":"2015-03-15T00:39:41Z","total_time":3573,"total_avs":43,"progress_percentage":100,"in_queue":0,"scan_all_result_a":"Clean"},"file_info":{"file_size":2925760,"upload_timestamp":"2014-11-21T16:28:20Z","md5":"E32AE4E6FDED29C239978066EC486B87","sha1":"09F0D5473811E106B04184E79B87863A4CA18389","sha256":"99C8F44D78B335F57F75AAFFDCAA54C31A8BBBB036B05AA00ECA919C68570D3B","file_type_category":"E","file_type_description":"Win32 Executable MS Visual C++ (generic)","file_type_extension":"EXE\/DLL","display_name":"procexp.exe"},"data_id":"3a91ff29b649474c9e80326cafa0c0d5","top_threat":-1}'; 
    var STATUS = 200;
  
    var response = verifyFileReport(200, SCAN_REPORT);
   
    suite.assertNull(response.getError());
    
    var reports = response.getReports();
    
    //report.getEngine
    //report.getType
    
    suite.assertEquals(1, reports.length);
    suite.assertEquals(false, reports[0].hasError());
    suite.assertEquals(false, reports[0].isPending());
    suite.assertEquals(true, reports[0].hasReport());
    suite.assertEquals(43, reports[0].getTotal());
    suite.assertEquals(0, reports[0].getPositives());
  });
  

  suite.add( function() {     
    
    suite.log("getFileReport - Report Threat found"); 
    
    var STATUS = 200;
    var SCAN_REPORT = '{"' +
    		'file_id":"17a05c7a2bc64b648c2fe719be787f66",' +
    		'"scan_results":{' +
    		  '"scan_details":{' +
    		    '"AegisLab":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":1950},' +
    		    '"Agnitum":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":125},' +
    		    '"Ahnlab":{"scan_result_i":1,"threat_found":"W97M\/Downloader","def_time":"2015-12-09T00:00:00Z","scan_time":31},' +
    		    '"Antiy":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":2340},' +
    		    '"AVG":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":63},' +
    		    '"Avira":{"scan_result_i":1,"threat_found":"W97M\/Dldr.Agent.78337","def_time":"2015-12-09T00:00:00Z","scan_time":16},' +
    		    '"Baidu":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":1170},' +
    		    '"BitDefender":{"scan_result_i":1,"threat_found":"W97M.Downloader.AJH","def_time":"2015-12-10T00:00:00Z","scan_time":280},' +
    		    '"ByteHero":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":578},' +
    		    '"ClamAV":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":764},' +
    		    '"CYREN":{"scan_result_i":1,"threat_found":"W97M\/Downldr","def_time":"2015-12-10T00:00:00Z","scan_time":4259},' +
    		    '"DrWebGateway":{"scan_result_i":1,"threat_found":"W97M.DownLoader.769","def_time":"2015-12-10T00:00:00Z","scan_time":2028},' +
    		    '"Emsisoft":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":1},' +
    		    '"ESET":{"scan_result_i":1,"threat_found":"VBA\/TrojanDownloader.Agent.ALI trojan","def_time":"2015-12-10T00:00:00Z","scan_time":16},' +
    		    '"Filseclab":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":343},' +
    		    '"Fortinet":{"scan_result_i":1,"threat_found":"WM\/TrojDownloader.F20F!tr","def_time":"2015-12-10T00:00:00Z","scan_time":280},' +
    		    '"F-prot":{"scan_result_i":1,"threat_found":"W97M\/Downldr","def_time":"2015-12-10T00:00:00Z","scan_time":1},' +
    		    '"F-secure":{"scan_result_i":1,"threat_found":"Trojan:W97M\/MaliciousMacro.GEN","def_time":"2015-12-10T00:00:00Z","scan_time":1669},' +
    		    '"Hauri":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":109},' +
    		    '"Ikarus":{"scan_result_i":1,"threat_found":"Trojan-Downloader.VBA.Agent","def_time":"2015-12-10T00:00:00Z","scan_time":1},' +
    		    '"Jiangmin":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":15225},' +
    		    '"K7":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":16},' +
    		    '"Kaspersky":{"scan_result_i":1,"threat_found":"Trojan-Downloader.VBS.Agent.azt","def_time":"2015-12-10T00:00:00Z","scan_time":125},' +
    		    '"Lavasoft":{"scan_result_i":1,"threat_found":"W97M.Downloader.AJH","def_time":"2015-12-10T00:00:00Z","scan_time":6833},' +
    		    '"McAfee":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":188},' +
    		    '"Microsoft":{"scan_result_i":1,"threat_found":"TrojanDownloader:O97M\/Adnel.M","def_time":"2015-12-09T00:00:00Z","scan_time":2620},' +
    		    '"NANO":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":47},' +
    		    '"nProtect":{"scan_result_i":1,"threat_found":"Trojan-Dropper\/W97M.Bouen","def_time":"2015-12-10T00:00:00Z","scan_time":93},' +
    		    '"Preventon":{"scan_result_i":1,"threat_found":"Troj\/DocDl-AMO","def_time":"2015-12-10T00:00:00Z","scan_time":124},' +
    		    '"QuickHeal":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":62},' +
    		    '"Sophos":{"scan_result_i":1,"threat_found":"Troj\/DocDl-AMO","def_time":"2015-12-10T00:00:00Z","scan_time":31},' +
    		    '"STOPzilla":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-08T00:00:00Z","scan_time":6147},' +
    		    '"SUPERAntiSpyware":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":1794},' +
    		    '"Symantec":{"scan_result_i":1,"threat_found":"W97M.Downloader","def_time":"2015-12-09T00:00:00Z","scan_time":1311},' +
    		    '"ThreatTrack":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":156},' +
    		    '"TotalDefense":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-07T00:00:00Z","scan_time":15},' +
    		    '"TrendMicro":{"scan_result_i":1,"threat_found":"W2KM_DR.5220B0E0","def_time":"2015-12-10T00:00:00Z","scan_time":1654},' +
    		    '"TrendMicroHouseCall":{"scan_result_i":1,"threat_found":"W2KM_DL.5B698218","def_time":"2015-12-08T00:00:00Z","scan_time":1295},' +
    		    '"VirIT":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":78},' +
    		    '"VirusBlokAda":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":47},' +
    		    '"Xvirus":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-07T00:00:00Z","scan_time":1388},' +
    		    '"Zillya!":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-08T00:00:00Z","scan_time":62},' +
    		    '"Zoner":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":16}},' +
    		  '"rescan_available":true,"data_id":"0a6b5b6a4e4947ad8721e81b8055483f","scan_all_result_i":1,"start_time":"2015-12-10T09:44:55Z",' +
    		  '"total_time":16473,"total_avs":43,"progress_percentage":100,"in_queue":0,"scan_all_result_a":"Infected"},' +
    		'"file_info":{"file_size":78336,"upload_timestamp":"2015-12-08T09:57:05Z",' +
    		  '"md5":"BF1C2CBB5A61603356E458D7384CE11F",' +
    		  '"sha1":"966E0C768F2655AFF188BEA935E2A435DD9610F3",' +
    		  '"sha256":"A09980529FBC2505B3B4D518EAF98B3ACB345FCE2109DD7E1E959D9B4522DA49",' +
    		  '"file_type_category":"D","file_type_description":"Microsoft Word document","file_type_extension":"DOC","display_name":"virus.DOC"},' +
    		'"data_id":"0a6b5b6a4e4947ad8721e81b8055483f",' +
    		'"top_threat":-1}';
 
    var response = verifyFileReport(200, SCAN_REPORT);
   
    suite.assertNull(response.getError());
    
    var reports = response.getReports();
    
    //report.getEngine
    //report.getType
    
    suite.assertEquals(1, reports.length);
    suite.assertEquals(false, reports[0].hasError());
    suite.assertEquals(false, reports[0].isPending());
    suite.assertEquals(true, reports[0].hasReport());
    suite.assertEquals(43, reports[0].getTotal());
    suite.assertEquals(19, reports[0].getPositives());
  });

  
  suite.add( function() {     
    
    suite.log("getFileReport - Report Threat found engines excluded");
    
    var STATUS = 200;
    var SCAN_REPORT = '{"' +
        'file_id":"17a05c7a2bc64b648c2fe719be787f66",' +
        '"scan_results":{' +
          '"scan_details":{' +
            '"AegisLab":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":1950},' +
            '"Agnitum":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":125},' +
            '"Ahnlab":{"scan_result_i":1,"threat_found":"W97M\/Downloader","def_time":"2015-12-09T00:00:00Z","scan_time":31},' +
            '"Antiy":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":2340},' +
            '"AVG":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":63},' +
            '"Avira":{"scan_result_i":1,"threat_found":"W97M\/Dldr.Agent.78337","def_time":"2015-12-09T00:00:00Z","scan_time":16},' +
            '"Baidu":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":1170},' +
            '"BitDefender":{"scan_result_i":1,"threat_found":"W97M.Downloader.AJH","def_time":"2015-12-10T00:00:00Z","scan_time":280},' +
            '"ByteHero":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":578},' +
            '"ClamAV":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":764},' +
            '"CYREN":{"scan_result_i":1,"threat_found":"W97M\/Downldr","def_time":"2015-12-10T00:00:00Z","scan_time":4259},' +
            '"DrWebGateway":{"scan_result_i":1,"threat_found":"W97M.DownLoader.769","def_time":"2015-12-10T00:00:00Z","scan_time":2028},' +
            '"Emsisoft":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":1},' +
            '"ESET":{"scan_result_i":1,"threat_found":"VBA\/TrojanDownloader.Agent.ALI trojan","def_time":"2015-12-10T00:00:00Z","scan_time":16},' +
            '"Filseclab":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":343},' +
            '"Fortinet":{"scan_result_i":1,"threat_found":"WM\/TrojDownloader.F20F!tr","def_time":"2015-12-10T00:00:00Z","scan_time":280},' +
            '"F-prot":{"scan_result_i":1,"threat_found":"W97M\/Downldr","def_time":"2015-12-10T00:00:00Z","scan_time":1},' +
            '"F-secure":{"scan_result_i":1,"threat_found":"Trojan:W97M\/MaliciousMacro.GEN","def_time":"2015-12-10T00:00:00Z","scan_time":1669},' +
            '"Hauri":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":109},' +
            '"Ikarus":{"scan_result_i":1,"threat_found":"Trojan-Downloader.VBA.Agent","def_time":"2015-12-10T00:00:00Z","scan_time":1},' +
            '"Jiangmin":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":15225},' +
            '"K7":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":16},' +
            '"Kaspersky":{"scan_result_i":1,"threat_found":"Trojan-Downloader.VBS.Agent.azt","def_time":"2015-12-10T00:00:00Z","scan_time":125},' +
            '"Lavasoft":{"scan_result_i":1,"threat_found":"W97M.Downloader.AJH","def_time":"2015-12-10T00:00:00Z","scan_time":6833},' +
            '"McAfee":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":188},' +
            '"Microsoft":{"scan_result_i":1,"threat_found":"TrojanDownloader:O97M\/Adnel.M","def_time":"2015-12-09T00:00:00Z","scan_time":2620},' +
            '"NANO":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":47},' +
            '"nProtect":{"scan_result_i":1,"threat_found":"Trojan-Dropper\/W97M.Bouen","def_time":"2015-12-10T00:00:00Z","scan_time":93},' +
            '"Preventon":{"scan_result_i":1,"threat_found":"Troj\/DocDl-AMO","def_time":"2015-12-10T00:00:00Z","scan_time":124},' +
            '"QuickHeal":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":62},' +
            '"Sophos":{"scan_result_i":1,"threat_found":"Troj\/DocDl-AMO","def_time":"2015-12-10T00:00:00Z","scan_time":31},' +
            '"STOPzilla":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-08T00:00:00Z","scan_time":6147},' +
            '"SUPERAntiSpyware":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":1794},' +
            '"Symantec":{"scan_result_i":1,"threat_found":"W97M.Downloader","def_time":"2015-12-09T00:00:00Z","scan_time":1311},' +
            '"ThreatTrack":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-10T00:00:00Z","scan_time":156},' +
            '"TotalDefense":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-07T00:00:00Z","scan_time":15},' +
            '"TrendMicro":{"scan_result_i":1,"threat_found":"W2KM_DR.5220B0E0","def_time":"2015-12-10T00:00:00Z","scan_time":1654},' +
            '"TrendMicroHouseCall":{"scan_result_i":1,"threat_found":"W2KM_DL.5B698218","def_time":"2015-12-08T00:00:00Z","scan_time":1295},' +
            '"VirIT":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":78},' +
            '"VirusBlokAda":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":47},' +
            '"Xvirus":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-07T00:00:00Z","scan_time":1388},' +
            '"Zillya!":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-08T00:00:00Z","scan_time":62},' +
            '"Zoner":{"scan_result_i":0,"threat_found":"","def_time":"2015-12-09T00:00:00Z","scan_time":16}},' +
          '"rescan_available":true,"data_id":"0a6b5b6a4e4947ad8721e81b8055483f","scan_all_result_i":1,"start_time":"2015-12-10T09:44:55Z",' +
          '"total_time":16473,"total_avs":43,"progress_percentage":100,"in_queue":0,"scan_all_result_a":"Infected"},' +
        '"file_info":{"file_size":78336,"upload_timestamp":"2015-12-08T09:57:05Z",' +
          '"md5":"BF1C2CBB5A61603356E458D7384CE11F",' +
          '"sha1":"966E0C768F2655AFF188BEA935E2A435DD9610F3",' +
          '"sha256":"A09980529FBC2505B3B4D518EAF98B3ACB345FCE2109DD7E1E959D9B4522DA49",' +
          '"file_type_category":"D","file_type_description":"Microsoft Word document","file_type_extension":"DOC","display_name":"virus.DOC"},' +
        '"data_id":"0a6b5b6a4e4947ad8721e81b8055483f",' +
        '"top_threat":-1}';

    settings.when("getExcluded", true).thenReturn(["AVG", "Zoner", "Avira"]);    
        
    var response = verifyFileReport(200, SCAN_REPORT);
   
    suite.assertNull(response.getError());
    
    var reports = response.getReports();
    
    //report.getEngine
    //report.getType
    
    suite.assertEquals(1, reports.length);
    suite.assertEquals(false, reports[0].hasError());
    suite.assertEquals(false, reports[0].isPending());
    suite.assertEquals(true, reports[0].hasReport());
    suite.assertEquals(40, reports[0].getTotal());
    suite.assertEquals(18, reports[0].getPositives());
    suite.assertEquals("a09980529fbc2505b3b4d518eaf98b3acb345fce2109dd7e1e959d9b4522da49", reports[0].getResource());
    suite.assertEquals("https://www.metascan-online.com/#!/results/file/0a6b5b6a4e4947ad8721e81b8055483f/regular", reports[0].getLink());
    
  });

  // TODO check engine registration
  
}(window));
