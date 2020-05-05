/**
 * Solace utilities for Node-RED: flow properties
 * Copyright Solace Corporation and other contributors <https://solace.com/>
 * Released under Apache 2.0 license
 */

var misc = require('./misc.js');
var flow = require('./flow.js');
/* private functions ----------------------*/

var _meta = {
  packageId: 'utils',
  componentId: 'flowProperties',
  version: '0.2.0'
}

/**
* general functions
*/
function getMetaInfo() {
  _meta = flow.getMetaInfo(_meta);
  return _meta;
}

function createDefaultFlowProperties() {
  return flowProperties = {
      packageId: 'unknown',
      componentId: 'unknown',
      instanceName: 'unknown'
  }
}
function createFlowProperties(packageId, componentId) {
  return flowProperties = {
      packageId: packageId,
      componentId: componentId,
      instanceName: componentId
  }
}

function getFlowPath() {
  return flow.getBasePath(_meta);
}

function getParentFlowPath() {
  return '$parent.' + getFlowPath();
}

function setMsgFlowProperties(msg, flowProperties) {
  let update = {
    payload: {
      _flowProperties: flowProperties
    }
  }
  return misc.merge(msg, update);
}

function getMsgFlowProperties(msg) {
  if(!misc.hasObjectPath(msg, 'payload._flowProperties')) return  createDefaultFlowProperties();
  return msg.payload._flowProperties;
}

module.exports = {
  getMetaInfo,
  createDefaultFlowProperties,
  createFlowProperties,
  getFlowPath,
  getParentFlowPath,
  setMsgFlowProperties,
  getMsgFlowProperties
}

// The end.
