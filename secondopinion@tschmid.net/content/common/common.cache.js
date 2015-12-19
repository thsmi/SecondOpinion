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
  
  /* global Components*/
  /* global net */
  /* global Task */
	/* global Sqlite */
  
  var Cu = Components.utils;
  var Ci = Components.interfaces;
  var Cc = Components.classes;

  Cu.import("resource://gre/modules/Services.jsm");  
  Cu.import("resource://gre/modules/NetUtil.jsm");  
  Cu.import("resource://gre/modules/XPCOMUtils.jsm");
  Cu.import("resource://gre/modules/Sqlite.jsm");
  Cu.import("resource://gre/modules/Promise.jsm");
  Cu.import("resource://gre/modules/Task.jsm");
    
    
  function SecondOpinionReports() {}

  SecondOpinionReports.prototype = {   
    
    _synchronizeStorage: function(task, callback) {
    
      Task.spawn(function() {
    
        let db = null;  
        let result = null;
    
        try {
          // Open a database
          db = yield Sqlite.openConnection({ path: ".\\extensions\\secondopinion@tschmid.net\\storage\\cache2.sqlite", sharedMemoryCache: true } );
       
          result = yield task(db);
      
        } catch (ex) {
          // Opening the database failed. We report this but continue as planed.
          Cu.reportError("Exception "+ex.toSource());   
          
          if (ex.stack)
            Cu.reportError(ex.stack.toString());
        } finally {
          // Don't forget to close the database or you will have bad surprises during shutdown
          if (db) 
            yield db.close();
        }
      
        if (callback)
          callback(result);
      });
    }, 
    
   _loadReportByRow : function(item) {
      
      var engine = item.getResultByName("engine");
      var type =  item.getResultByName("type");
      
      var report = {
        resource : item.getResultByName("resource"),
        positives : item.getResultByName("positives") ,
        total : item.getResultByName("total"),
        link : item.getResultByName("link"),
        pending : item.getResultByName("pending")      
      };
    
      if (!net.tschmid.secondopinion.engine)
        throw new Error("No reports registered");
      
      if (!net.tschmid.secondopinion.engine[engine])
        throw new Error("No reports registered for engine "+engine);
      
      if (!net.tschmid.secondopinion.engine[engine][type])
        throw new Error("No reports registered for type "+engine+":"+type);
        
      if (!net.tschmid.secondopinion.engine[engine][type].Report)
        throw new Error("No reports registered for type "+engine+":"+type);        
      
      return (new (net.tschmid.secondopinion.engine[engine][type].Report)()).loadByRow(report);      
    },    
    
	/**
	 * Searches for the given reports in the database.
	 * As soon as the resources are ready the callback is invoked.
	 * The callback is guaranteed to be called. In case no results 
	 * were found an empty array passed to the callback.
	 *
	 * @param{String|String[]} resources
	 *   the resources which should be loaded.
	 * @param{callback} callback
	 *   the callback which should be called on completion.	 * 
	 */
  loadReports : function(resources, callback) {
        
    // we do a fast forward in case the storage is disabled.
    if (!this.getSettings().isCacheEnabled()) {        
      callback([]);
      return;
    } 
	  
	  if (!Array.isArray(resources))
	    resources = [resources];  
	
	  if (resources.length === 0) {		  
      callback([]);
      return;		  
	  }	 
		  	  
	  var self = this;
      
      let task = function *loadReportsTask(db) {
        let hasTable = yield db.tableExists("reports");
        
        if (!hasTable)
          return [];
        
		    self.getLogger().logDebug("Searching report for "+resources +" in database");
		
        // an in statement with variadic input is a bit ugly...
        let sql = "";       
        resources.forEach( function() {
            sql += ( sql ? ", ": "" ) + "?";
        } );
		
        sql = "SELECT * FROM reports WHERE resource IN ( "+sql+" )"; 
        
        let rows = yield db.execute(sql, resources);
		
		    self.getLogger().logDebug("Found "+rows.length+" matching reports for "+ resources +" in database");
      
        // Skip in case no resource were found...
        if (rows.length < 1)
          return [];
                
        let results = [];
        
        rows.forEach( function(item) {          
          var report = self._loadReportByRow(item);
          results.push(report);
        });
          
        return results;    
      };
    
      return this._synchronizeStorage(task, callback);    
      
    },	
		
    /**
     * Stores a scan the results for an resource, so that they are available
     * when offline.
     *
     * Pending means the file or url was submitted but there are no results.
     * In case pending is true, positives and total are always -1.
     * Same applies when the latter parameters are omitted
     *
     * We work with a black list, so it does not make any sense to store 
     * reports with zero positive results. Such reports will be silently discarded.
     *  
     * @param{String} resource
     *   the resource unique name it's either the attachment's unique checksum or the link's url
     * @param{Boolean} pending
     *   true in case the request was submitted but no response received.
     * @param{String} url
     *   the url which can be used to view details about the scan results.
     * @optional @param{int} positives
     *   the number of scan engines which returned a positive result
     * @optional @param{int} total
     *   the total number of scan engines which checked the resource.      
	 * @optional @param{boolean} force
	 *   forces adding entries with zero positives.
     **/
    storeReport : function(report, force) {
    
      // We can skip right here in case caching is disabled.
      if (!this.getSettings().isCacheEnabled())
        return;
	
      var self = this;
    
      let task = function *storeReportTask(db) {
    
        let hasTable = yield db.tableExists("reports");      
      
        // We create the cache in case the table does not exists...
        // ... otherwise we do some cleanup
        if (!hasTable) {          
          yield db.execute("CREATE TABLE reports (resource TEXT, pending INTEGER, positives INTEGER, total INTEGER, link TEXT, engine INTEGER , type INTEGER, created DATETIME, unique(resource, engine, type))");              
        }
        else {
          var whiteListAge = self.getSettings().getMaxWhiteListAge();
          var blackListAge = self.getSettings().getMaxBackListAge();
          // All back listed entries with positives are kept for 14days while white listed entries are dropped after one day...
          yield db.execute("DELETE FROM reports WHERE ( positives > 0 AND created < DateTime('now','-"+blackListAge+" days')) OR (positives <= 0 AND created < DateTime('now','-"+whiteListAge+" hours')) ");
		    }
                   
        // We do some cleanup to keep the number of pending reports down.
        //
        // In case the report is not pending but has an invalid positive count we trigger the cleanup.
        // Unless force is set in explicit, we use a black list which means an report with zero positives is 
        // an handled as an invalid report. 		
		
        if (!report.isPending() && ((report.getPositives() < 0) || (report.getPositives() === 0 && !force))) {
			
          self.getLogger().logDebug("Dropping pending/stalled report "+report.getResource()+" from Database");
		  
          yield db.execute("DELETE FROM reports WHERE resource = :resource ", {resource: report.getResource()});
          return;
		    }		
        
		    var params = {
          resource: report.getResource(),
          pending : ((!!report.isPending())? 1 : 0),
          positives: report.getPositives(),
          total: report.getTotal(),
          link: report.getLink(),
          engine : report.getEngine(),
          type : report.getType()
        };	
		
        self.getLogger().logDebug("Saving report "+report.getResource()+" to Database");
		
        // Otherwise we update or insert the report.
        yield db.execute("REPLACE INTO reports VALUES (:resource , :pending, :positives, :total, :link, :engine, :type, DateTime('now'))", params );    
      };
    
      return this._synchronizeStorage(task);  
    },     
    
    /**
     * Checks the resource's scan report is pending. 
     * 
     * @param{String} resource
     *   the attachment's  or url's unique resource name 
     * 
     * @return{Boolean}
     *   true in case the resource is pending, otherwise false
     **/
    isReportPending : function(resource) {
    
      if (!this.getSettings().isCacheEnabled())
        return false;
      
      let task = function *isReportPendingTask(db) {
        let hasTable = yield db.tableExists("reports");
  
        if (!hasTable)
          return;
        
        let rows = yield db.execute("SELECT * FROM reports WHERE resource = :sum", {
          sum: ""+resource
        });
      
        // Skip in case resource found...
        if (rows.length != 1)
          return false;
        
        return true;      
      };  
    
      return this._synchronizeStorage(task);
    },  
      
    getSettings : function() {
      if (!net.tschmid.secondopinion.SETTINGS)
        throw "Failed to import settings";
    
      return net.tschmid.secondopinion.SETTINGS;
    },    
	
	  getLogger : function() {
	    if (!net.tschmid.secondopinion.LOGGER)
		    throw "Failed to import logger";  
	
	    return net.tschmid.secondopinion.LOGGER;
	  }
  };
  
  if (!exports.net)
    exports.net = {};

  if (!exports.net.tschmid)
    exports.net.tschmid = {};

  if (!exports.net.tschmid.secondopinion)
    exports.net.tschmid.secondopinion = {};  
  
  // Export an instance to the global Scope  
  exports.net.tschmid.secondopinion.CACHE = new SecondOpinionReports();  
 
}(this));
