"use strict";

if (!Cu)
  var Cu = Components.utils;
if (!Ci)
  var Ci = Components.interfaces;
if (!Cc)
  var Cc = Components.classes;

Cu.import("resource://gre/modules/Services.jsm");  
Cu.import("resource://gre/modules/NetUtil.jsm");  
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Sqlite.jsm");
Cu.import("resource://gre/modules/Promise.jsm");
Cu.import("resource://gre/modules/Task.jsm");

var net = net || {};

if (!net.tschmid)
  net.tschmid = {};

if (!net.tschmid.secondopinion)
  net.tschmid.secondopinion = {};

(function() {
    
  function SecondOpinionReports() {}

  SecondOpinionReports.prototype = {   
    
    _synchronizeStorage: function(task, callback) {
    
      Task.spawn(function() {
    
        let db = null;  
        let result = null;
    
        try {
          // Open a database
          db = yield Sqlite.openConnection({ path: ".\\extensions\\secondopinion@tschmid.net\\storage\\cache.sqlite", sharedMemoryCache: false } );
       
          result = yield task(db);
      
        } catch (ex) {
          // Opening the database failed. We report this but continue as planed.
          Cu.reportError("Exception "+ex.toSource());         
        } finally {
          // Don't forget to close the database or you will have bad surprises during shutdown
          if (db) 
            yield db.close();
        }
      
        if (callback)
          callback(result);
      });
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
	
	  if (resources.length == 0) {		  
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
          results.push( {
            resource : item.getResultByName("resource"),
            positives : item.getResultByName("positives") ,
            total : item.getResultByName("total"),
            permalink : item.getResultByName("permalink"),
            pending : item.getResultByName("pending")           
          })
        })
          
        return results;    
      }
    
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
    storeReport : function(resource, pending, url, positives, total, force) {
    
      // We can skip right here in case caching is disabled.
      if (!this.getSettings().isCacheEnabled())
        return;
	
	  var self = this;
    
      let task = function *storeReportTask(db) {
    
      let hasTable = yield db.tableExists("reports");      
      
        // We create the cache in case the table does not exists...
        // ... otherwise we do some cleanup
        if (!hasTable) {          
          yield db.execute("CREATE TABLE reports (resource TEXT, pending INTEGER, positives INTEGER, total INTEGER, permalink TEXT, created DATETIME)");              
          yield db.execute("CREATE UNIQUE INDEX idx_report_resource ON reports(resource)");                
        }
        else {
		  // All back listed entries with positives are kept for 14days while white listed entries are dropped after one day...
          yield db.execute("DELETE FROM reports WHERE ( positives > 0 AND created < DateTime('now','-14 days')) OR (positives <= 0 AND created < DateTime('now','-1 days')) ");
		}
          
        // On the one hand positives and total can't be zero and on the other hand they may be...
        // ... omitted thus we need to ensure we set it to something valid.
        if (positives == null || positives < 0)   
          positives = -1;
        
        if (total == null || total < 0)
          total = -1;     
          
		
		// We do some cleanup to keep the number of pending reports down.
		//
		// In case the report is not pending but has an invalid positive count we trigger the cleanup.
		// Unless force is set in explicit, we use a black list which means an report with zero positives is 
		// an handled as an invalid report. 		
		
		if (!pending && ((positives < 0) || (positives == 0 && !force))) {
			
		  self.getLogger().logDebug("Dropping pending/stalled report "+resource+" from Database");
		  
		  yield db.execute("DELETE FROM reports WHERE resource = :resource ", {resource: resource});
		  return;
		}		
        
		var params = {
          resource: resource,
          pending : ((!!pending)? 1 : 0),
          positives: positives,
          total: total,
          permalink: url,
        };	
		
		self.getLogger().logDebug("Saving report "+resource+" to Database");
		
        // Otherwise we update or insert the report.
        yield db.execute("REPLACE INTO reports VALUES (:resource , :pending, :positives, :total, :permalink, DateTime('now'))", params );    
      }
    
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
      }  
    
      return this._synchronizeStorage(task);
    },  
      
    getSettings : function() {
      if (!net.tschmid.secondopinion.settings)
        throw "Failed to import settings";
    
      return net.tschmid.secondopinion.settings;
    },    
	
	getLogger : function() {
	  if (!net.tschmid.secondopinion.logger)
		throw "Failed to import logger";  
	
	  return net.tschmid.secondopinion.logger;
	}
  }
  
  // Export an instance to the global Scope  
  net.tschmid.secondopinion.reports = new SecondOpinionReports();       
}());  