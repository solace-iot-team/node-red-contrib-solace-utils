/**
 * Solace utilities for Node-RED: forEach
 * Copyright Solace Corporation and other contributors <https://solace.com/>
 * Released under Apache 2.0 license
 */

//var misc = require('./misc.js');
var flow = require('./flow.js');

/* private functions ----------------------*/

var _meta = {
  packageId: 'utils',
  componentId: 'forEach',
  version: '0.2.1'
}

/**
* general functions
*/
function getMetaInfo() {
  _meta = flow.getMetaInfo(_meta);
  return _meta;
}

module.exports = {
  getMetaInfo
}

// The end.
