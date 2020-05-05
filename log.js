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
  version: '0.1.0',
  shortName: 'log'
}

/**
* general functions
*/
function getMetaInfo() {
  _meta = flow.getMetaInfo(_meta);
  return _meta;
}
function getLogPath(logName) {
  return '$parent.' + flow.getBasePath(_meta) + '.' + logName;
}
function createInitializedStateObject() {
  return {
  };
}

module.exports = {
  getMetaInfo,
  getLogPath,
  createInitializedStateObject
}

 // The end.
