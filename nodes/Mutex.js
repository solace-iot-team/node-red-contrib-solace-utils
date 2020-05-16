/**
 * Solace utilities for Node-RED: Mutex
 * Copyright Solace Corporation and other contributors <https://solace.com/>
 * Released under Apache 2.0 license
 */

module.exports = function(RED) {

  var _Mutex = require('async-mutex').Mutex;
  var _withTimeout = require('async-mutex').withTimeout;
  
  function Mutex(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      this._properties = {
        name: config.name,
        releaseFunc: null      
      };

      this._mutex = new _Mutex();

      this.on('close', function(removed, done) {
        done();
      });

  }

  Mutex.prototype.acquire = async function(mutexTimeout = 0) {
    var node = this;

    try {

      let mutex = this._mutex;

      if(mutexTimeout > 0) mutex = _withTimeout(this._mutex, mutexTimeout, new Error('timeout'));

      this._properties.releaseFunc = await mutex.acquire();

      return 'true';
    
    } catch(err) {
      // could be a promise rejection for mutex with timeout
      if(typeof err === 'object') {

        if(err.message === 'timeout') {
          return err.message;
        } else {
          node.error(err);
          throw err;
        }

      } else {
        node.error(err);
        throw err;  
      }
    }
  }

  Mutex.prototype.release = function() {
    var node = this;
    try {

      if(!this._mutex.isLocked()) return 'false';

      this._properties.releaseFunc();

      return 'true';

    } catch(err) {
      node.error(err);
      throw err;
    }
  }

  Mutex.prototype.isLocked = function() {
    var node = this;
    try {

      if(this._mutex.isLocked()) return 'isLocked';
      else return '!isLocked';

    } catch(err) {
      node.error(err);
      throw err;
    }
  }
  
  RED.nodes.registerType("Mutex", Mutex);

}



