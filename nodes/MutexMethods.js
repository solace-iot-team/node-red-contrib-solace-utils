/**
 * Solace utilities for Node-RED: MutexMethods
 * Copyright Solace Corporation and other contributors <https://solace.com/>
 * Released under Apache 2.0 license
 */

module.exports = function(RED) {

  MutexMethods.methodDisplayMap = new Map([
    ["acquireBlock", "acquire/blocking"],
    ["acquireWithTimeout", "acquire/timeout"],
    ["release", "release"],
    ["getIsLocked", "get/isLocked"]
  ]);

  function MutexMethods(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      this._mutex = RED.nodes.getNode(config.mutex);

      this._properties = {
        name: config.name,
        method: config.method,
        mutexTimeout: parseInt(config.mutexTimeout),
        isDone: false
      }

      node.on('input', function(msg, send, done) {
        
        let err = null;
        
        this._properties.input = {
          msg: msg,
          done: done
        };

        switch(this._properties.method) {
          
          case 'acquireBlock': {

            node.status( { fill: "yellow", shape: "ring", text: `${MutexMethods.methodDisplayMap.get(this._properties.method)}` });

            this.acquire();
          
          }
          break;
          case 'acquireWithTimeout': {
          
            node.status( { fill: "yellow", shape: "ring", text: `${MutexMethods.methodDisplayMap.get(this._properties.method)}:${this._properties.mutexTimeout} ms` });
          
            this.acquire(this._properties.mutexTimeout); 

          }
          break;
          case 'release': {

            this.release(); 

          } 
          break;          
          case 'getIsLocked': {

            this.getIsLocked(); 

          } 
          break;          
          default: {
            err = `unknown method:'${this._properties.method}'`; 
          }
        }

        if(err) this.handleErr(err);
    
      });

      node.on('close', function(removed, done) {
        node.status({});
        done();
      });

  }

  MutexMethods.prototype.handleErr = function(err) {
    var node = this;
    
    this._properties.isDone = true;
    
    node.status( { fill:"red", shape:"dot", text:`err:'${err}'` });
    
    this._properties.input.done(err);

  }

  MutexMethods.prototype.handleResult = function(result) {
    var node = this;

    try {
     
      if(this._properties.isDone) return;

      switch(result) {
        case 'true':
          node.status( { fill: "green", shape: "dot", text: `success:${MutexMethods.methodDisplayMap.get(this._properties.method)}` });
          node.send([this._properties.input.msg, null]);
          break;
        case 'false': 
          node.status( { fill: "yellow", shape: "dot", text: `failed:${MutexMethods.methodDisplayMap.get(this._properties.method)}` });
          node.send([null, this._properties.input.msg]);
          break;
        case 'timeout':
          node.status( { fill: "yellow", shape: "dot", text: `timeout:${MutexMethods.methodDisplayMap.get(this._properties.method)}` });
          node.send([null, this._properties.input.msg]);
          break;
        case 'isLocked':
          node.status( { fill: "green", shape: "dot", text: 'isLocked: true' });
          node.send([this._properties.input.msg, null]);
          break;
        case '!isLocked': 
          node.status( { fill: "yellow", shape: "dot", text: 'isLocked: false' });
          node.send([null, this._properties.input.msg]);
          break;
          default: {
          throw new Error(`unknown result for ${this._properties.method}: ${result}`)
        }  
      }

      this._properties.input.done();

    } catch(err) {
      this.handleErr(err);
    }
  }

  MutexMethods.prototype.acquire = async function(mutexTimeout = 0) { 
    var node = this;

    try { 

      const result = await this._mutex.acquire(mutexTimeout);

      this.handleResult(result);

    } catch(err) {
      this.handleErr(err);
    }
  }  

  MutexMethods.prototype.release = function() { 
    var node = this;

    try {

      const result = this._mutex.release();

      this.handleResult(result);

    } catch(err) {
      this.handleErr(err);
    }
  }  

  MutexMethods.prototype.getIsLocked = function() { 
    var node = this;

    try {

      const result = this._mutex.isLocked();

      this.handleResult(result);

    } catch(err) {
      this.handleErr(err);
    }
  }  

  RED.nodes.registerType("MutexMethods", MutexMethods);
}
