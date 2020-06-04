/**
 * Solace utilities for Node-RED: SolaceError
 * Copyright Solace Corporation and other contributors <https://solace.com/>
 * Released under Apache 2.0 license
 */

function shortUUID() {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

var _isEmpty = require('lodash.isempty');
var _isEqual = require('lodash.isequal');
var _isString = require('lodash.isstring');
var _isBoolean = require('lodash.isboolean');
var _isNumber = require('lodash.isnumber');
var _isObject = require('lodash.isobject');
var _has = require('lodash.has');
var _get = require('lodash.get');
var _set = require('lodash.set');
var _unset = require('lodash.unset');
var _startsWith = require('lodash.startswith');
var _endsWith = require('lodash.endswith');
var _find = require('lodash.find');
var _merge = require('lodash.merge');
var _toNumber = require('lodash.tonumber');
var _sortBy = require('lodash.sortby');
var _padStart = require('lodash.padstart');

/*
note: JSON.stringify() does not print empty keys. but they might still be there.
isObjectEmptyTest: o = {}
isObjectEmptyTest: o.keys = ["sempv2mqttSession"]

isObjectEmptyTest: o = {}
isObjectEmptyTest: _isEmpty(o) = true
*/
function isObjectEmptyTest(o) {

  if(o === undefined || o === null) return true;

  if(!_isObject(o)) {
    console.log('\n\n\n');
    console.log('isObjectEmptyTest: o = ' + JSON.stringify(o, null, 1));
    console.log('isObjectEmptyTest: !isObject(o) = true');
    return true;
  }
  if(_isEmpty(o)) {
    console.log('\n\n\n');
    console.log('isObjectEmptyTest: o = ' + JSON.stringify(o, null, 1));
    console.log('isObjectEmptyTest: _isEmpty(o) = true');
    return true;
  }

  if(o.length !== undefined) {
    // length is always undefined
    console.log('isObjectEmptyTest: o.length = ' + o.length);
  }
  // this comparison does not work
  if(_isEqual(o, {})) {
    console.log('\n\n\n');
    console.log('isObjectEmptyTest: o = ' + JSON.stringify(o, null, 1));
    console.log('isObjectEmptyTest: _isEqual(o, {}) = true');
    return true;
  }

  /*
  console.log('\n\n\n');
  console.log('isObjectEmptyTest: o = ' + JSON.stringify(o, null, 1));
  console.log('isObjectEmptyTest: o.keys = ' + JSON.stringify(Object.keys(o)));
  */

  if(Object.keys(o).length === 0) {
    //var size = Object.keys(myObj).length;
    console.log('\n\n\n');
    console.log('isObjectEmptyTest: o = ' + JSON.stringify(o, null, 1));
    console.log('isObjectEmptyTest: (o.keys.length === 0) = true');
    return true;
  }

  return false;
}
function isObjectEmpty(o) {
  //return isObjectEmptyTest(o);
  if( o === undefined || o === null ||
      !_isObject(o) || _isEmpty(o)
    ) return true;
  return false;
}
function isEmpty(any) {
  return _isEmpty(any);
}
function isStringEmpty(s) {
  if(!_isEmpty(s) && _isString(s)) return false;
  else return true;
}
function isObject(o) {
  return _isObject(o);
}
function isString(s) {
  return _isString(s);
}
function isNumber(n) {
  return _isNumber(n);
}
function isBoolean(b) {
  return _isBoolean(b);
}
function isArray(a) {
  return Array.isArray(a);
}
function isArrayEmpty(a) {
  if(Array.isArray(a) && a.length > 0) return false;
  else return true;
}

function hasObjectPath(o, p) {
  return _has(o, p);
}
function getObjectPath(o, p, d) {
  return _get(o, p, d);
}
function setObjectPath(o, p, v) {
  let ps = p.split('.');
  return _set(o, ps, v);
}
function unsetObjectPath(o, p) {
  let ps = p.split('.');
  return _unset(o, ps);
}
function startsWith(str, target, pos) {
  return _startsWith(str, target, pos);
}
function endsWith(str, target, pos) {
  return _endsWith(str, target, pos);
}
function find(collection, predicate, fromIndex) {
  return _find(collection, predicate, fromIndex);
}
function merge(object, sources) {
  return _merge(object, sources);
}
function toNumber(value) {
  return _toNumber(value);
}
function sortBy(collection, iteratees) {
  return _sortBy(collection, iteratees)
}
function padStart(string, length, chars) {
  return _padStart(string, length, chars);
}

/**
* validations
*/
/**
 * todo this is not the correct regexp for a topic string.
 * should:
 * - not start or end with a /
 * - group between // must not be empty
 * And define a valid SubMqttTopicString (which can contain # and + in certain places)
 */
function isValidPubTopicString(s) {
  return s.match(/^[A-Za-z0-9\/\._-]+$/);
}
function isValidId(s) {
  return s.match(/^[A-Za-z0-9_-]+$/);
}

// _.isEqualWith(value, other, [customizer])

function validateStringPropertyIsValidPubTopic(p, s) {
    if(isStringEmpty(s)) return {issue: "string property is empty", property: p, received: s};
    if(!isValidPubTopicString(s)) return {issue: "string property is not a valid publish topic", property: p, received: s};
    return null;
}
function validateStringPropertyIsValidId(p, s) {
    if(isStringEmpty(s)) return {issue: "string property is empty", property: p, received: s};
    if(!isValidId(s)) return {issue: "string property is not a valid id", property: p, received: s};
    return null;
}
function validateObjectPropertiesAgainstReference(o, oref, validateStringProperty=null) {
    let issues = [];
    for(var p in oref) {
        if(!hasObjectPath(o, p)) issues.push({issue: 'missing property', property: p});
        else if(typeof(oref[p]) !== typeof(o[p])) issues.push({issue: 'property type mismatch', property: p, expected: typeof(oref[p]), received: typeof(o[p])});
        else {
            switch(typeof(oref[p])) {
            case 'string':
                if(validateStringProperty !== null) {
                  let issue = validateStringProperty(p, o[p]);
                  if(issue !== null) issues.push(issue);
                }
                break;
            case 'object':
                let recursiveIssues = validateObjectPropertiesAgainstReference(o[p], oref[p], validateStringProperty);
                issues = issues.concat(recursiveIssues);
                break;
            default:
                break;
            }
        }
    }
    return issues;
}


module.exports = {
  shortUUID,
   uuid,
   isObjectEmptyTest,
   isObjectEmpty,
   isEmpty,
   isStringEmpty,
   isObject,
   isString,
   isNumber,
   isBoolean,
   isArray,
   isArrayEmpty,
   hasObjectPath,
   getObjectPath,
   setObjectPath,
   unsetObjectPath,
   startsWith,
   endsWith,
   find,
   merge,
   toNumber,
   sortBy,
   padStart,
   isValidPubTopicString,
   isValidId,
   validateStringPropertyIsValidPubTopic,
   validateStringPropertyIsValidId,
   validateObjectPropertiesAgainstReference,

}
 // The End.
