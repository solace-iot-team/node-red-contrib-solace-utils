/**
 * Solace utilities for Node-RED: Logger
 * Copyright Solace Corporation and other contributors <https://solace.com/>
 * Released under Apache 2.0 license
 */

module.exports = function(RED) {

  function Logger(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      // Retrieve the config node
      this.log = RED.nodes.getNode(config.log);

      this.properties = {
        log: this.log.getProperties(),
        name: config.name,
        method: config.method,
        msgPath: config.msgPath
      }

      node.on('input', function(msg, send, done) {
        
        let err = null;

        switch(this.properties.method) {
          case 'clear': {
            err = this.clear(); 
          }
          break;
          case 'init': {
            err = this.init(msg); 
          } 
          break;
          case 'append': {
            err = this.append(msg); 
          }
          break;
          case 'prepend': {
            err = this.prepend(msg); 
          }
          break;
          case 'get': {
            msg.payload = this.get(); 
          }
          break;
          default: {
            err = `unknown method:'${this.properties.method}'`; 
          }
        }

        // debug
        /*
        msg._Logger = {
            input: 'Log got an input: ' + msg.payload,
            properties: this.properties,
            log: this.log.getLog()
        };
        */

        if(!err) {
          node.status( { fill:"green", shape:"dot", text:`success:'${this.properties.method}'` });
          send(msg);
          done();
        } else {
          node.status( { fill:"red", shape:"dot", text:`err:'${err}'` });
          done(err);
        }

      });
      
      node.on('close', function(removed, done) {
        node.status({});
        done();
      });
  }

  Logger.prototype.clear = function() { 
    this.log.clearLog();
    return null;
  }  

  Logger.prototype.init = function(msg) { 
    let logEntry = RED.util.getMessageProperty(msg, this.properties.msgPath);
    if(logEntry === undefined) return `cannot find input in msg:'${this.properties.msgPath}'`; 
    this.log.initLog(logEntry);
    return null;
  }  

  Logger.prototype.append = function(msg) { 
    let logEntry = RED.util.getMessageProperty(msg, this.properties.msgPath);
    if(logEntry === undefined) return `cannot find input in msg:'${this.properties.msgPath}'`; 
    this.log.appendLog(logEntry);
  }  

  Logger.prototype.prepend = function(msg) { 
    let logEntry = RED.util.getMessageProperty(msg, this.properties.msgPath);
    if(logEntry === undefined) return `cannot find input in msg:'${this.properties.msgPath}'`; 
    this.log.prependLog(logEntry);
  }  

  Logger.prototype.get = function() { 
    return this.log.getLog();
  }  

  RED.nodes.registerType("Logger", Logger);
}
