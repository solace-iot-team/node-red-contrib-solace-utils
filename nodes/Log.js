/**
 * Solace utilities for Node-RED: Log
 * Copyright Solace Corporation and other contributors <https://solace.com/>
 * Released under Apache 2.0 license
 */


/**
 * @todo
 * - config node: Log: the actual log
 * - palette node: Logger: the actions
 * 
 */

module.exports = function(RED) {

  var misc = require('../src/misc.js');

  function Log(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      this.properties = {
        name: config.name,
        maxEntries: config.maxEntries,
        isAddTimestamp2Entries: config.isAddTimestamp2Entries,
      };
      // initialize the log
      this.log = [];
  
      this.on('close', function(removed, done) {
        if (removed) {
            //node.log("LogConfig.onClose: this node has been removed completely, clean up the log");
        } else {
            //node.log("LogConfig.onClose: this node has been re-started, clean up the log");
        }
        this.clearLog();
        done();
      });

  }

  Log.prototype.getProperties = function() { return this.properties; }

  Log.prototype.createLogEntry = function(logEntry) {
    if(this.properties.isAddTimestamp2Entries) {
      logEntry.timestamp = new Date().toISOString();
    }
    return logEntry;
  }

  Log.prototype.clearLog = function() { 
    this.log.length = 0
  }

  Log.prototype.initLog = function(logEntry) {
    this.clearLog();
    if(!misc.isObject(logEntry)) logEntry = { entry: logEntry };
    if(!misc.isObjectEmpty(logEntry)) this.log.push(this.createLogEntry(logEntry));
  }

  Log.prototype.appendLog = function(logEntry) {
    if(this.log.length+1 > this.properties.maxEntries) this.log.shift();
    if(!misc.isObject(logEntry)) logEntry = { entry: logEntry };
    if(!misc.isObjectEmpty(logEntry)) this.log.push(this.createLogEntry(logEntry));
  }

  Log.prototype.getLog = function () { return this.log; }

  RED.nodes.registerType("Log", Log);
}



