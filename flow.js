/**
 * Solace utilities for Node-RED:
 * Package: flow
 * Copyright Solace Corporation and other contributors <https://solace.com/>
 * Released under Apache 2.0 license
 */

var misc = require('./misc.js');
var SolaceError = require('./SolaceError.js');

/**
* path functions
*/
function getRootPath() { return '_solaceAppRuntimeState'; }
function getPackageBasePath(meta) {
  return getRootPath() + '.' + meta.packageId;
}
function getBasePath(meta) {
  return getRootPath() + '.' + meta.packageId + '.' + meta.componentId;
}
function getIsInitializedPath(meta) {
  return getBasePath(meta) + '.isInitialized';
}
function getPropertiesPath(meta) {
  return getBasePath(meta) + '.properties';
}
/*
unused at the moment
function getVersionPath(meta) {
  return getPropertiesPath(meta) + '.version';
}
function getInstanceIdPath(meta) {
  return getPropertiesPath(meta) + '.instanceId';
}
*/
/**
* msg payload functions
*/
function getMsgOutputBasePath(meta) {
  return meta.packageId + '.' + meta.componentId;
}
function getMsgPayloadBasePath(meta) {
    return 'payload.' + getMsgOutputBasePath(meta);
}
function getMsgPayloadPath(meta, path) {
  return getMsgPayloadBasePath(meta) + '.' + path;
}
function getMsgPayload(msg, meta, path) {
  return misc.getObjectPath(msg, getMsgPayloadPath(meta, path));
}
function setMsgPayload(msg, meta, path, value) {
  let p = getMsgPayloadPath(meta, path);
  return misc.setObjectPath(msg, p, value);
}

/**
* general
*/
function getMetaInfo(meta) {
  meta._meta = {
    packageId: 'utils',
    componentId: 'flow',
    version: '0.2.2'
  }
  return meta;
}
function getDefaultProperties(meta) {
  let properties = {
    meta: meta,
    instance: {
      instanceId: 'default',
      instanceName: 'default'
    }
  };
  return properties;
}

/**
* msg functions
*/
function getOrgPayloadPath() { return '_payload'; }

/*function getMsgInstancePropertiesOrgPayloadPath(meta) {
  return getPropertiesPath(meta) + getOrgPayloadPath();
}
*/
function unsetMsg(msg, meta, isAddOriginalPayload = false) {

  /*
  if(isAddOriginalPayload) {
    let orgPayload = getMsgInstanceProperties(msg, meta)[getOrgPayloadPath()];
    if(!misc.isEmpty(orgPayload)) msg[getOrgPayloadPath()] =  orgPayload;
    //console.log('flow.unsetMsg: isAddOriginalPayload = true');
    //console.log('flow.unsetMsg: msg[getOrgPayloadPath()]')

  }
  */
  return misc.unsetObjectPath(msg, getBasePath(meta));
  //leaves: _solace.{packageId} - delete if empty
  /*
  this does not work
  misc.unsetObjectPath(msg, getStateBasePath() + '.' + packageId);
  o = misc.getObjectPath(msg, getStateBasePath());
  if(o !== undefined && misc.isObjectEmpty(o)) misc.unsetObjectPath(msg, getStateBasePath());
  */
  return msg;
}
function unsetMsgAll(msg) {
  return misc.unsetObjectPath(msg, getRootPath());
}
function getMsgProperties(msg, meta) {
  return misc.getObjectPath(msg, getPropertiesPath(meta), null);
}
function getMsgMetaProperties(msg, meta) {
  return misc.getObjectPath(msg, getPropertiesPath(meta) + '.meta', null);
}
function initMsgProperties(msg, meta, isSaveOrgPayload=false) {
  let props = getDefaultProperties(meta);
  props.instance.instanceId = misc.uuid();
  /*
  if(isSaveOrgPayload && !misc.isEmpty(msg.payload)) {
    props.instance[getOrgPayloadPath()] = JSON.parse(JSON.stringify(msg.payload));
  }
  */
  return misc.setObjectPath(msg, getPropertiesPath(meta) , props);
}
function getMsgInstanceProperties(msg, meta) {
  if(!isValidFlowMsg(msg, meta)) return null;
  return misc.getObjectPath(msg, getPropertiesPath(meta) + '.instance', null);
}
function updateMsgInstanceProperties(msg, meta, uprops) {
  let props = misc.getObjectPath(msg, getPropertiesPath(meta) + '.instance');
  misc.merge(props, uprops);
  return misc.setObjectPath(msg, getPropertiesPath(meta) + '.instance', props);
}
function isValidFlowMsg(msg, meta) {
  if(misc.isObjectEmpty(getMsgProperties(msg, meta))) {
    console.log('\n\n\n\flow.isValidFlowMsg: isObjectEmpty = true');
    console.log('flow.isValidFlowMsg: getMsgProperties = ' + JSON.stringify(getMsgProperties(msg, meta)));
  }

  return (!misc.isObjectEmpty(getMsgProperties(msg, meta)));
}
function createSolaceError(msg, meta, message, details) {
    let properties = getMsgProperties(msg, meta);
    if(misc.isObjectEmpty(properties)) properties = getDefaultProperties(meta);
    return new SolaceError(properties.meta.packageId + '.' + properties.meta.componentId, properties.instance.instanceName, message, 'ERROR', details, msg);
}
function getMsgSolaceError(msg, meta) {
  var properties = getMsgProperties(msg, meta);
  if(misc.isObjectEmpty(properties)) properties = getDefaultProperties(meta);
  var se = new SolaceError();
  if(!se.populateFromMsgError(msg)) {
    // not a SolaceError
    se.setComponentName(properties.meta.packageId + '.' + properties.meta.componentId);
    se.setInstanceName(properties.instance.instanceName);
    se.setMsg(msg);
  }
  /*
  // not required if in createSolaceError we add the original message
  // copy all properties into details
  let details = {
    details: se.getDetails(),
    properties: properties
  }
  se.setDetails(details);
  */
  return se;
}

/** ^^^^ done */

/** todo from here onwards */
/*
function createStateObjectProperties(componentName, displayName, version) {
  return {
      componentName: componentName,
      displayName: displayName,
      version: version,
      instanceId: misc.uuid()
  }
}

function setMsgMetaProperties(msg, packageId, componentId, meta) {
    if(packageId !== undefined && componentId !== undefined)
        msg = misc.setObjectPath(msg, getMsgPropertiesPath(packageId, componentId) + '.meta', meta);
    return msg;
}

function getMsgPropertiesUser(msg, packageId, componentId) {
    let properties = getMsgProperties(msg, packageId, componentId);
    if(misc.isObjectEmpty(properties.user)) return null;
    return properties.user;
}
function getMsgPropertiesUserMethod(msg, packageId, componentId) {
    let properties = getMsgProperties(msg, packageId, componentId);
    if(misc.isObjectEmpty(properties) || misc.isObjectEmpty(properties.user) || misc.isStringEmpty(properties.user.method)) return null;
    return properties.user.method;
}
function setMsgPropertiesInstance(msg, packageId, componentId, instanceProperties) {
  if(packageId !== undefined && componentId !== undefined)
      return misc.setObjectPath(msg, getMsgPropertiesPath(packageId, componentId) + '.instance', instanceProperties);
  else return {};
}
function getMsgPropertiesInstance(msg, packageId, componentId) {
  let properties = getMsgProperties(msg, packageId, componentId);
  if(misc.isObjectEmpty(properties) || misc.isObjectEmpty(properties.instance)) return null;
  return properties.instance;
}
function getMsgPropertiesStatePath(msg, packageId, componentId) {
  let properties = getMsgProperties(msg, packageId, componentId);
  if(misc.isObjectEmpty(properties.meta) || misc.isStringEmpty(properties.meta.statePath)) return null;
  return properties.meta.statePath;
}

function isValidSubflowMsgInstance(msg, packageId, componentId) {
  if(getMsgPropertiesInstance(msg, packageId, componentId) === null) return false;
  return true;
}
*/



module.exports = {
  /* state object */
  getMetaInfo,
  //createStateObjectProperties,
  /* path */
  getPackageBasePath,
  getBasePath,
  getIsInitializedPath,
  getPropertiesPath,
  /* msg payload */
  getMsgOutputBasePath,
  getMsgPayloadPath,
  getMsgPayload,
  setMsgPayload,
  /* msg */
  unsetMsg,
  unsetMsgAll,
  getMsgProperties,
  getMsgMetaProperties,
  initMsgProperties,
  getMsgInstanceProperties,
  updateMsgInstanceProperties,
  isValidFlowMsg,
  createSolaceError,
  getMsgSolaceError,

  //unsetMsgProperties,
  //setMsgMetaProperties,
  //setMsgUserProperties,
  //addMsgUserProperties,
  //getMsgPropertiesUser,
  //getMsgPropertiesUserMethod,
  //setMsgPropertiesInstance,
  //getMsgPropertiesInstance,
  //getMsgPropertiesStatePath,
  //isValidSubflowMsg,
  //isValidSubflowMsgInstance,

}

 // The end.
