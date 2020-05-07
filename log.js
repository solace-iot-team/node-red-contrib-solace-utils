/**
 * Solace application utilities for Node-RED:
 * Package: utils.log
 * Copyright Solace Corporation and other contributors <https://solace.com/>
 * Released under Apache 2.0 license
 */

var flow = require('./flow.js');

/* private functions ----------------------*/

var _meta = {
  packageId: 'utils',
  componentId: 'log',
  version: '0.1.1',
  shortName: 'log'
}

/**
* general functions
*/
function getMetaInfo() {
  _meta = flow.getMetaInfo(_meta);
  return _meta;
}

function createInitializedStateObject() {
  return {
  };
}

/**
* log instance functions
*/
function getLogBasePath(logName) {
  return '$parent.' + flow.getBasePath(_meta) + '.' + logName;
}
function getLogPath(logName) {
  return getLogBasePath(logName) + '.log';
}

function createLogProperties(mips) {
  return {
    maxEntries: mips.maxEntries,
    isAddTimestamp: mips.isAddTimestamp,
    log: []
  };
}
function createLogEntry(logProperties, logEntry) {
  if(logProperties.isAddTimestamp) {
    logEntry.timestamp = new Date().toISOString();
  }
  return logEntry;
}


module.exports = {
  getMetaInfo,
  createInitializedStateObject,
  getLogBasePath,
  getLogPath,
  createLogProperties,
  createLogEntry
}

 // The end.
