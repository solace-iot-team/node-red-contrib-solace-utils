/**
 * Solace utilities for Node-RED: SolaceError
 * Copyright Solace Corporation and other contributors <https://solace.com/>
 * Released under Apache 2.0 license
 */

/**
* todo
* - caughtBy ==> catchStack: array of caughtBy
*
*/



var misc = require('./misc.js');

/* private functions ----------------------*/

var _meta = {
  packageId: 'utils',
  componentId: 'SolaceError',
  version: '0.2.1'
}
/**
* general functions
*/
SolaceError.getMetaInfo = function() {
  return _meta;
}

/**
* @note returns the string of SolaceError.solaceError element.
* change that, you must change it here too.
*/
SolaceError.getSolaceErrorObjectElement = function () { return 'solaceError'; }

SolaceError.createStateProperties = function(se, totalErrorCount) {
  let properties = {totalErrorCount: totalErrorCount};
  misc.merge(properties, se.getAsDataObject());
  return properties;
}
SolaceError.getStatePropertiesTotalErrorCount = function(properties) {
  let totalErrorCount = 0;
  if(!misc.isObjectEmpty(properties)) totalErrorCount = properties.totalErrorCount;
  return totalErrorCount;
}
SolaceError.updateStatePropertiesTotalErrorCount = function(properties, totalErrorCount) {
  let update = {totalErrorCount: totalErrorCount};
  misc.merge(properties, update);
  return properties;
}
SolaceError.getStatePropertiesSolaceError = function(properties) {
  let se = new SolaceError();
  if(!se.populateFromMsgError(properties)) return null;
  return se;
}

/*
properties = {
    count: count+1,
    solaceError: msg.solaceError
}

properties = SolaceError.getStateProperties(count+1, se.getAsDataObject());
*/


/**
 * todo: THIS IS JUST AN EXAMPLE
 *
 * Returns an error object.
 * @param {string} componentName - the component throwing the error
 * @param {string} instanceName - the instance of the component throwing the error
 * @returns {Object} The error object containing 1 element: solaceUtilsError
 * @example
 * if(error) {
 *   let message = 'my user message';
 *   let errObj = composeError('my component', 'my instance', message, 'ERROR', null, null);
 *   node.error(message, errObj);
 *   return;
 * }
 */


function SolaceError(componentName, instanceName, message, severity, details, msg) {
  if(misc.isStringEmpty(componentName)) componentName = 'UNKNOWN';
  if(misc.isStringEmpty(instanceName)) instanceName = 'UNKNOWN';
  if(misc.isStringEmpty(message)) message = 'UNKNOWN ERROR';
  if(misc.isStringEmpty(severity)) severity = 'ERROR';
  if(misc.isObjectEmpty(details)) details = {};
  if(misc.isObjectEmpty(msg)) msg = {};
  this.solaceError = {
    origin: {
      componentName: componentName,
      instanceName: instanceName,
      source: {}
    },
    message: message,
    severity: severity,
    details: details,
    msg: msg,
    caughtBy: {}
  }
}
SolaceError.prototype.populateFromMsgError = function(msg) {

  misc.merge(this.solaceError, msg.solaceError);

  if(!misc.isObjectEmpty(msg.error) && !misc.isObjectEmpty(msg.error.source)) {
    // check for exsiting source, if yes, copy to _source first
    // only if _source does not exist already, supports only 2 deep
    if(!misc.isObjectEmpty(this.solaceError.origin.source) && misc.isObjectEmpty(this.solaceError.origin._source)) {
      this.solaceError.origin._source = this.solaceError.origin.source;
    }
    this.solaceError.origin.source = JSON.parse(JSON.stringify(msg.error.source));
    this.setMessage(msg.error.message);
  }
  return (!misc.isObjectEmpty(msg.solaceError));
}
SolaceError.prototype.setMsgError = function(msg) {
  msg.solaceError = this.getAsDataObject();
}
SolaceError.prototype.getAsDataObject = function() {
  return JSON.parse(JSON.stringify(this));
}
SolaceError.prototype.setMessage = function(message) {
  if(!misc.isStringEmpty(message)) {
    this.solaceError.message = message;
    return true;
  } else return false;
}
SolaceError.prototype.getMessage = function() {
  return this.solaceError.message.toString();
}
SolaceError.prototype.toString = function() {
  return JSON.stringify(this, null, 1);
}
SolaceError.prototype.setCaughtBy = function(caughtBy) {
  this.solaceError.caughtBy = JSON.parse(JSON.stringify(caughtBy));
}
SolaceError.prototype.getCaughtBy = function() {
  return this.solaceError.caughtBy;
}
SolaceError.prototype.setComponentName = function(name) {
  this.solaceError.origin.componentName = name;
}
SolaceError.prototype.getComponentName = function() {
  return this.solaceError.origin.componentName;
}
SolaceError.prototype.setInstanceName = function(name) {
  this.solaceError.origin.instanceName = name;
}
SolaceError.prototype.getInstanceName = function() {
  return this.solaceError.origin.instanceName;
}
SolaceError.prototype.getDetails = function() {
  return this.solaceError.details;
}
SolaceError.prototype.setDetails = function(details) {
  this.solaceError.details = JSON.parse(JSON.stringify(details));
}
SolaceError.prototype.setMsg = function(msg) {
  this.solaceError.msg = JSON.parse(JSON.stringify(msg));
}
SolaceError.prototype.getSeverity = function() {
  return this.solaceError.severity;
}
SolaceError.prototype.getSourceType = function() {
  return this.solaceError.origin.source.type;
}
SolaceError.prototype.getSourceName = function() {
  return this.solaceError.origin.source.name;
}
SolaceError.prototype.getPreviousSourceType = function() {
  if(!misc.isObjectEmpty(this.solaceError.origin._source)) {
    return this.solaceError.origin._source.type;
  } else return null;
}
SolaceError.prototype.getPreviousSourceName = function() {
  if(!misc.isObjectEmpty(this.solaceError.origin._source)) {
    return this.solaceError.origin._source.name;
  } else return null;
}
SolaceError.prototype.mergeInto = function(msg) {
  let newMsg = (misc.isObjectEmpty(msg)) ? {} : msg;
  misc.merge(newMsg, this.getAsDataObject());
  return newMsg;
}


module.exports = SolaceError;

// The end.
